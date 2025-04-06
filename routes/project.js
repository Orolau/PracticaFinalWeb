const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/session.js");
const checkProjectExistence = require("../middleware/checkProjectExistence.js");
const { validatorCreateProject } = require("../validators/project.js");
const { createProject } = require("../controllers/project.js");

router.post('/', authMiddleware, checkProjectExistence, validatorCreateProject, createProject)

module.exports = router;