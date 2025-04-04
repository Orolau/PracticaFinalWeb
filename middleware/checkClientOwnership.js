const { clientModel } = require('../models');
const { handleHttpError } = require("../utils/handleError");

const checkClientOwnership = async (req, res, next) => {
  try {
    const clientId = req.params.id;
    const userId = req.user._id;

    const client = await clientModel.findById(clientId);

    if (!client) {
      return handleHttpError(res, 'CLIENT_NOT_FOUND', 404)
    }

    if (client.userId.toString() !== userId.toString()) {
        return handleHttpError(res, 'NOT_YOUR_CLIENT', 403)
    }

    next();
  } catch (err) {
    handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
  }
};

module.exports = checkClientOwnership;
