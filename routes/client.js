const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/session.js");
const { createClient, updateClient, getClients, getClientById } = require("../controllers/client.js");
const { validatorCreateClient, validatorUpdateClient } = require("../validators/client.js");
const checkDuplicateClientName = require("../middleware/checkDuplicatedClientName.js");
const checkClientOwnership = require("../middleware/checkClientOwnership.js");

router.post('/', authMiddleware, validatorCreateClient, checkDuplicateClientName, createClient);
router.patch('/:id', authMiddleware, validatorUpdateClient, checkClientOwnership, updateClient);
router.get('/', authMiddleware, getClients);
router.get('/:id', authMiddleware, checkClientOwnership, getClientById)

module.exports = router; 