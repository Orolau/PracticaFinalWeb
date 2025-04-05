const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/session.js");
const { createClient, updateClient, getClients, getClientById, deleteClient, archiveClient, getArchivedClients, restoreClient } = require("../controllers/client.js");
const { validatorCreateClient, validatorUpdateClient, validateIdParam } = require("../validators/client.js");
const checkDuplicateClientName = require("../middleware/checkDuplicatedClientName.js");
const checkClientOwnership = require("../middleware/checkClientOwnership.js");
const checkClientDeletedOwnership = require("../middleware/checkClientDeletedOwnership.js");

/**
 * @openapi
 * /api/client:
 *  post:
 *      tags:
 *      - Client
 *      summary: Create a new client
 *      description: Create a new client associated with the logged-in user
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/clientData"
 *      responses:
 *          '200':
 *              description: Client created successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/allClientData"
 *          '401':
 *              description: Unauthorized. The provided code is incorrect.
 *          '409':
 *              description: Client name already exists
 *          '422':
 *              description: Validation error. The request body contains invalid fields
 *          '500':
 *              description: Internal Server Error
 */

router.post('/', authMiddleware, validatorCreateClient, checkDuplicateClientName, createClient);
/**
 * @openapi
 * /api/client/{id}:
 *  patch:
 *      tags:
 *      - Client
 *      summary: Update client
 *      description: Update client info by ID. Only the owner or company users can update
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/clientData"
 *      responses:
 *          '200':
 *              description: Client updated successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/allClientData"
 *          '401':
 *              description: Unauthorized. The provided code is incorrect
 *          '403':
 *              description: Client does not belong to user or company
 *          '404':
 *              description: Client does not exist
 *          '422':
 *              description: Validation error
 *          '500':
 *              description: Internal Server Error
 */

router.patch('/:id', authMiddleware, validateIdParam, validatorUpdateClient, checkClientOwnership, updateClient);
/**
 * @openapi
 * /api/client:
 *  get:
 *      tags:
 *      - Client
 *      summary: Get all clients
 *      description: Returns all clients belonging to the user or company
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          '200':
 *              description: List of clients
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: "#/components/schemas/allClientData"
 *          '401':
 *              description: Unauthorized. The provided code is incorrect
 *          '500':
 *              description: Internal Server Error
 */

router.get('/', authMiddleware, getClients);
/**
 * @openapi
 * /api/client/archive:
 *  get:
 *      tags:
 *      - Client
 *      summary: Get archived clients
 *      description: Returns archived (soft-deleted) clients for the user or company
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          '200':
 *              description: List of archived clients
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: "#/components/schemas/allClientData"
 *          '401':
 *              description: Unauthorized. The provided code is incorrect
 *          '500':
 *              description: Internal Server Error
 */

router.get('/archive', authMiddleware, getArchivedClients);
/**
 * @openapi
 * /api/client/{id}:
 *  get:
 *      tags:
 *      - Client
 *      summary: Get client by ID
 *      description: Get client details by ID if user or company owns it
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          '200':
 *              description: Client details
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/allClientData"
 *          '401':
 *              description: Unauthorized. The provided code is incorrect.
 *          '403':
 *              description: Client does not belong to user or company
 *          '422':
 *              description: Invalid ID
 *          '500':
 *              description: Internal Server Error
 */

router.get('/:id', authMiddleware, validateIdParam, checkClientOwnership, getClientById);
/**
 * @openapi
 * /api/client/archive/{id}:
 *  patch:
 *      tags:
 *      - Client
 *      summary: Restore archived client
 *      description: Restore an archived (soft-deleted) client if owned by user or company
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          '200':
 *              description: Client restored successfully
 *          '401':
 *              description: Unauthorized. The provided code is incorrect
 *          '403':
 *              description: Client not owned by user or company
 *          '404':
 *              description: Client does not exist
 *          '422':
 *              description: Invalid ID
 *          '500':
 *              description: Internal Server Error
 */

router.patch('/archive/:id', authMiddleware, checkClientDeletedOwnership, restoreClient);
/**
 * @openapi
 * /api/client/{id}:
 *  delete:
 *      tags:
 *      - Client
 *      summary: Permanently delete client
 *      description: Completely removes a client owned by the user or company
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          '200':
 *              description: Client deleted successfully
 *          '401':
 *              description: Unauthorized. The provided code is incorrect
 *          '403':
 *              description: Client not owned by user or company
 *          '404':
 *              description: Client does not exist
 *          '422':
 *              description: Invalid ID
 *          '500':
 *              description: Internal Server Error
 */

router.delete('/:id', authMiddleware, validateIdParam, checkClientOwnership, deleteClient);
/**
 * @openapi
 * /api/client/archive/{id}:
 *  delete:
 *      tags:
 *      - Client
 *      summary: Archive (soft-delete) a client
 *      security:
 *          - bearerAuth: []
 *      description: Archives a client instead of deleting permanently
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          '200':
 *              description: Client archived successfully
 *          '401':
 *              description: Unauthorized. The provided code is incorrect
 *          '403':
 *              description: Client not owned by user or company
 *          '404':
 *              description: Client does not exist
 *          '422':
 *              description: Invalid ID
 *          '500':
 *              description: Internal Server Error
 */

router.delete('/archive/:id', authMiddleware, validateIdParam, checkClientOwnership, archiveClient);


module.exports = router; 