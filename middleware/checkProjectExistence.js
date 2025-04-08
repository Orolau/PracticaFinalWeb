const { projectModel, userModel } = require('../models');
const { handleHttpError } = require("../utils/handleError.js");

const checkProjectExistence = async (req, res, next) => {
    try {
        const { name, projectCode } = req.body;
        const userId = req.user._id.toString();
        const companyCif = req.user.company?.cif;
        const currentProjectId = req.params.id; // <-- ID del proyecto que se está actualizando

        // 1. Buscar proyectos que tengan el mismo nombre o código
        const existingProjects = await projectModel.find({
            $or: [
                { name },
                { projectCode }
            ]
        });

        // 2. Filtrar proyectos que sean distintos al que se está actualizando
        const conflictingProjects = existingProjects.filter(
            project => project._id.toString() !== currentProjectId
        );

        // Si no hay conflictos (todos eran el mismo proyecto), continuar
        if (conflictingProjects.length === 0) {
            return next();
        }

        // 3. Verificar si alguno pertenece al usuario actual
        const userConflict = conflictingProjects.find(
            project => project.userId.toString() === userId
        );

        if (userConflict) {
            return handleHttpError(res, "PROJECT_EXIST", 409);
        }

        // 4. Verificar si hay conflicto con usuarios de la misma compañía
        if (companyCif) {
            const usersInCompany = await userModel.find(
                { "company.cif": companyCif },
                "_id"
            );

            const userIdsInCompany = usersInCompany.map(user => user._id.toString());

            const companyConflict = conflictingProjects.find(
                project => userIdsInCompany.includes(project.userId.toString())
            );

            if (companyConflict) {
                return handleHttpError(res, "PROJECT_EXIST", 409);
            }
        }

        next();

    } catch (err) {
        handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

module.exports = checkProjectExistence;
