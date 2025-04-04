const { clientModel, userModel } = require('../models/index.js');
const { handleHttpError } = require("../utils/handleError.js");

const checkDuplicateClientName = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;
    const userCompanyCIF = req.user.company?.cif;

    // 1. Verificar si el usuario ya tiene un cliente con ese nombre
    const clientByUser = await clientModel.findOne({ name, userId });
    if (clientByUser) {
      return handleHttpError(res, 'CLIENT_EXISTS', 409)
    }

    // 2. Buscar usuarios que estén en la misma empresa
    const companyUsers = await userModel.find({ 'company.cif': userCompanyCIF }, '_id');
    const companyUserIds = companyUsers.map(user => user._id);

    // 3. Verificar si algún usuario de la misma empresa tiene ese cliente
    const clientInCompany = await clientModel.findOne({
      name,
      userId: { $in: companyUserIds }
    });

    if (clientInCompany) {
        return handleHttpError(res, 'CLIENT_EXISTS', 409)
    }

    // Si pasa ambas verificaciones, continúa
    next();
  } catch (err) {
    handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
  }
};
module.exports = checkDuplicateClientName