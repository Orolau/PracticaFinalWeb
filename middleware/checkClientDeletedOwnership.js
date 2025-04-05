const { clientModel, userModel } = require('../models');
const { handleHttpError } = require("../utils/handleError");

const checkClientDeletedOwnership = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const companyCif = req.user.company?.cif;


        const client = await clientModel.findOneDeleted({ _id: id });
        

        if (!client) {
            return handleHttpError(res, 'CLIENT_NOT_FOUND_OR_NOT_DELETED', 404);
        }

        if (client.userId.toString() === userId.toString()) {
            req.client = client;
            return next();
        }

        // Si el cliente pertenece a otro usuario de la misma empresa
        if (companyCif) {
            const owner = await userModel.findById(client.userId);
            if (owner?.company?.cif === companyCif) {
                req.client = client;
                
                return next();
            }
        }

        // Si no es ni dueño ni está en la misma empresa
        return handleHttpError(res, 'CLIENT_NOT_BELONG_TO_YOUR_COMPANY', 403);

    } catch (err) {
        console.log(err);
        handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500);
    }
};
module.exports = checkClientDeletedOwnership;