const { projectModel, userModel } = require('../models');
const { handleHttpError } = require("../utils/handleError.js");

const checkProjectExistence = async (req, res, next) => {
    try {
        const { name, projectCode } = req.body;
        const userId = req.user._id.toString();
        const companyCif = req.user.company?.cif;

        // 1. Buscar proyectos que tengan el mismo nombre o código
        const existingProjects = await projectModel.find({
            $or: [
                { name },
                { projectCode }
            ]
        });

        // Si no hay proyectos con conflictos, continuar
        if (existingProjects.length === 0) {
            return next();
        }

        // 2. Verificar si alguno pertenece al usuario actual
        const userConflict = existingProjects.find(
            project => project.userId.toString() === userId
        );

        if (userConflict) {
            return handleHttpError(res, "PROJECT_EXIST", 409)
        }

        // 3. Si el usuario tiene compañía, comprobar si algún otro usuario de su compañía tiene el proyecto
        if (companyCif) {
            // Buscar todos los usuarios que tienen la misma compañía
            const usersInCompany = await userModel.find(
                { "company.cif": companyCif },
                "_id"
            );

            const userIdsInCompany = usersInCompany.map(user => user._id.toString());

            const companyConflict = existingProjects.find(
                project => userIdsInCompany.includes(project.userId.toString())
            );

            if (companyConflict) {
                return handleHttpError(res, "PROJECT_EXIST", 409)
            }
        }

        // Si no hay conflicto, continuar
        next();

    } catch (err) {
        handleHttpError(res, "INTERNAL_SERVER_ERROR", 500)
    }
};

module.exports = checkProjectExistence;
