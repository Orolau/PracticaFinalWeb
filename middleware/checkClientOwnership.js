const { clientModel, userModel } = require('../models');
const { handleHttpError } = require("../utils/handleError");

const checkClientOwnership = async (req, res, next) => {
  try {
    const clientId = req.params.id;
    const userId = req.user._id;
    const userCompanyCif = req.user.company?.cif;

    const client = await clientModel.findById(clientId);

    if (!client) {
      return handleHttpError(res, 'CLIENT_NOT_FOUND', 404)
    }

    // Si el usuario es el dueño directo
    if (client.userId.toString() === userId.toString()) {
      req.client = client;
      return next();
    }

    // Si el cliente pertenece a otro usuario de la misma empresa
    if (userCompanyCif) {
      const owner = await userModel.findById(client.userId);
      if (owner?.company?.cif === userCompanyCif) {
        req.client = client;
        return next();
      }
    }

    // Si no es ni dueño ni está en la misma empresa
    return handleHttpError(res, 'NOT_YOUR_CLIENT', 403);

  } catch (err) {
    handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
  }
};

module.exports = checkClientOwnership;
