const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/session.js");
const { createClient, updateClient, getClients, getClientById, deleteClient, archiveClient, getArchivedClients } = require("../controllers/client.js");
const { validatorCreateClient, validatorUpdateClient, validateIdParam } = require("../validators/client.js");
const checkDuplicateClientName = require("../middleware/checkDuplicatedClientName.js");
const checkClientOwnership = require("../middleware/checkClientOwnership.js");

router.get('/archive', authMiddleware, getArchivedClients)
router.post('/', authMiddleware, validatorCreateClient, checkDuplicateClientName, createClient);
router.patch('/:id', authMiddleware, validateIdParam, validatorUpdateClient, checkClientOwnership, updateClient);
router.get('/', authMiddleware, getClients);
router.get('/:id', authMiddleware, validateIdParam, checkClientOwnership, getClientById);
router.delete('/:id', authMiddleware, validateIdParam, checkClientOwnership, deleteClient);
router.delete('/archive/:id', authMiddleware, validateIdParam, checkClientOwnership, archiveClient);


module.exports = router; 