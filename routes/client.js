const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/session.js");
const { createClient } = require("../controllers/client.js");
const { validatorCreateClient } = require("../validators/client.js");
const checkDuplicateClientName = require("../middleware/checkDuplicatedClientName.js");

router.post('/', authMiddleware, validatorCreateClient, checkDuplicateClientName, createClient);

module.exports = router; 