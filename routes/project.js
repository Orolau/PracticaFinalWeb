const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/session.js");
const checkProjectExistence = require("../middleware/checkProjectExistence.js");
const { validatorCreateProject, validatorUpdateProject } = require("../validators/project.js");
const { createProject, updateProject } = require("../controllers/project.js");
const { validateIdParam } = require("../validators/client.js");
const checkProjectOwnership = require("../middleware/checkProjectOwnership.js");

router.post('/', authMiddleware, checkProjectExistence, validatorCreateProject, createProject);
router.put('/:id', authMiddleware, validateIdParam, validatorUpdateProject, checkProjectOwnership, updateProject)

module.exports = router;