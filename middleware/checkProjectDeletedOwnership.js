const { projectModel, userModel } = require('../models/index.js');
const { handleHttpError } = require("../utils/handleError.js");

const checkProjectDeletedOwnership = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id.toString();
        const companyCif = req.user.company?.cif;

        // Buscar el proyecto por ID
        const project = await projectModel.findOneDeleted({ _id: id });
        if (!project) {
            return handleHttpError(res, "PROJECT_NOT_FOUND_OR_NOT_DELETED", 404)
        }

        // Si el proyecto pertenece directamente al usuario autenticado
        if (project.userId.toString() === userId.toString()) {
            req.project = project;
            return next();
        }

        // Si el usuario tiene una compañía, comprobar si el proyecto pertenece a un miembro de su empresa
        if (companyCif) {
            const usersInCompany = await userModel.find({ "company.cif": companyCif }, "_id");
            const userIdsInCompany = usersInCompany.map(user => user._id.toString());

            if (userIdsInCompany.includes(project.userId.toString())) {
                req.project = project;
                return next();
            }
        }

        // Si no cumple ninguna condición
        return handleHttpError(res, "PROJECT_NOT_BELONG_TO_YOUR_COMPANY", 403)

    } catch (err) {
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500 )
    }
};

module.exports = checkProjectDeletedOwnership;
