const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/session.js");
const checkProjectExistence = require("../middleware/checkProjectExistence.js");
const { validatorCreateProject, validatorUpdateProject } = require("../validators/project.js");
const { createProject, updateProject, getProjects, getProjectById, deleteProject, archiveProject, getArchivedProjects, restoreProject } = require("../controllers/project.js");
const { validateIdParam } = require("../validators/client.js");
const checkProjectOwnership = require("../middleware/checkProjectOwnership.js");
const checkProjectDeletedOwnership = require("../middleware/checkProjectDeletedOwnership.js");

router.post('/', authMiddleware, checkProjectExistence, validatorCreateProject, createProject);
router.put('/:id', authMiddleware, validateIdParam, validatorUpdateProject, checkProjectOwnership, updateProject);
router.get('/', authMiddleware, getProjects);
router.get('/archive', authMiddleware, getArchivedProjects);
router.get('/:id', authMiddleware, validateIdParam, checkProjectOwnership, getProjectById);
router.delete('/:id', authMiddleware, validateIdParam, checkProjectOwnership, deleteProject);
router.delete('/archive/:id', authMiddleware, validateIdParam, checkProjectOwnership, archiveProject);
router.patch('/archive/:id', authMiddleware, validateIdParam, checkProjectDeletedOwnership, restoreProject)


module.exports = router;