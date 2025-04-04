const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/session.js");
const { createClient, updateClient } = require("../controllers/client.js");
const { validatorCreateClient, validatorUpdateClient } = require("../validators/client.js");
const checkDuplicateClientName = require("../middleware/checkDuplicatedClientName.js");
const checkClientOwnership = require("../middleware/checkClientOwnership.js");

router.post('/', authMiddleware, validatorCreateClient, checkDuplicateClientName, createClient);
router.patch('/:id', authMiddleware, validatorUpdateClient, checkClientOwnership, updateClient);

module.exports = router; 