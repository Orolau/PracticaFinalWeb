const { deliverynoteModel, userModel } = require('../models');
const { handleHttpError } = require("../utils/handleError");

const checkDeliverynoteOwnership = async (req, res, next) => {
  try {
    const deliverynoteId = req.params.id;
    const userId = req.user._id;
    const userCompanyCif = req.user.company?.cif;

    const deliverynote = await deliverynoteModel.findById(deliverynoteId);

    if (!deliverynote) {
      return handleHttpError(res, 'DELIVERY_NOTE_NOT_FOUND', 404)
    }

    // Si el usuario es el dueño directo
    if (deliverynote.userId.toString() === userId.toString()) {
      req.deliverynote = deliverynote;
      return next();
    }

    // Si el albarán pertenece a otro usuario de la misma empresa
    if (userCompanyCif) {
      const owner = await userModel.findById(deliverynote.userId);
      if (owner?.company?.cif === userCompanyCif) {
        req.deliverynote = deliverynote;
        return next();
      }
    }

    // Si no es ni dueño ni está en la misma empresa
    return handleHttpError(res, 'DELIVERY_NOTE_DOES_NOT_BELONG_TO_YOUR_COMPANY', 403);

  } catch (err) {
    handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
  }
};

module.exports = checkDeliverynoteOwnership;
