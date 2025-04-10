const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/session.js");
const { validatorCreateDeliveryNote } = require("../validators/deliverynote.js");
const { createDeliverynote, getDeliverynotes, getDeliverynoteById, getDeliverynotePDF, signDeliveryNote, deleteDeliverynote } = require("../controllers/deliverynote.js");
const checkDeliverynoteOwnership = require("../middleware/checkDeliverynoteOwnership.js");
const { uploadMiddlewareMemory } = require("../utils/handleStorage.js");
const { validateIdParam } = require("../validators/client.js");

/**
 * @openapi
 * /api/deliverynote:
 *  post:
 *      tags:
 *      - Delivery Note
 *      summary: Create a new delivery note
 *      description: Creates a delivery note associated with the logged-in user
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/deliverynote"
 *      responses:
 *          '200':
 *              description: Delivery note created successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/deliverynote"
 *          '401':
 *              description: Unauthorized. The provided code is incorrect.
 *          '422':
 *              description: Validation error. The request body contains invalid fields
 *          '500':
 *              description: Internal Server Error
 */

router.post('/', authMiddleware, validatorCreateDeliveryNote, createDeliverynote);
/**
 * @openapi
 * /api/deliverynote:
 *  get:
 *      tags:
 *      - Delivery Note
 *      summary: Get all delivery notes
 *      description: Retrieves delivery notes created by the user. If the `company=true` query is provided, returns all delivery notes from the user's company.
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: query
 *            name: company
 *            schema:
 *              type: boolean
 *            description: Whether to fetch delivery notes for the entire company
 *      responses:
 *          '200':
 *              description: A list of delivery notes
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: "#/components/schemas/deliverynoteAllData"
 *          '401':
 *              description: Unauthorized. The provided code is incorrect.
 *          '500':
 *              description: Internal Server Error
 */
router.get('/', authMiddleware, getDeliverynotes);
/**
 * @openapi
 * /api/deliverynote/{id}:
 *  get:
 *      tags:
 *      - Delivery Note
 *      summary: Get delivery note by ID
 *      description: Retrieves a single delivery note by its ID, with user, client and project info
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: The ID of the delivery note
 *      responses:
 *          '200':
 *              description: Delivery note details
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/deliverynoteAllData"
 *          '401':
 *              description: Unauthorized. The provided code is incorrect.
 *          '403':
 *              description: Delivery note does not belong to user or company
 *          '404':
 *              description: Delivery note not found
 *          '422':
 *              description: Validation error. The id provided does not match the mongo id format.
 *          '500':
 *              description: Internal Server Error
 */

router.get('/:id', authMiddleware, validateIdParam, checkDeliverynoteOwnership, getDeliverynoteById);
/**
 * @openapi
 * /api/deliverynote/pdf/{id}:
 *  get:
 *      tags:
 *      - Delivery Note
 *      summary: Get PDF of a delivery note
 *      description: Retrieves the generated PDF of a delivery note stored in IPFS. Generates the PDF if it doesn't exist yet.
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: The ID of the delivery note
 *      responses:
 *          '200':
 *              description: PDF file (application/pdf)
 *              content:
 *                  application/pdf:
 *                      schema:
 *                          type: string
 *                          format: binary
 *          '401':
 *              description: Unauthorized. The provided code is incorrect.
 *          '403':
 *              description: Delivery note does not belong to user or company
 *          '404':
 *              description: Delivery note not found
 *          '422':
 *              description: Validation error. The id provided does not match the mongo id format.
 *          '500':
 *              description: Internal Server Error
 */

router.get('/pdf/:id', authMiddleware, validateIdParam, checkDeliverynoteOwnership, getDeliverynotePDF);
/**
 * @openapi
 * /api/deliverynote/sign/{id}:
 *  patch:
 *      tags:
 *      - Delivery Note
 *      summary: Sign a delivery note
 *      description: Uploads a signature image to IPFS and updates the delivery note. Then regenerates its PDF.
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: ID of the delivery note to sign
 *      requestBody:
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          image:
 *                              type: string
 *                              format: binary
 *                              description: Signature image file
 *      responses:
 *          '200':
 *              description: Delivery note signed successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/deliverynoteAllData"
 *          '401':
 *              description: Unauthorized. The provided code is incorrect.
 *          '403':
 *              description: Delivery note does not belong to user or company
 *          '404':
 *              description: Delivery note not found
 *          '422':
 *              description: Validation error. The id provided does not match the mongo id format.
 *          '500':
 *              description: Internal Server Error
 */

router.patch('/sign/:id', authMiddleware, validateIdParam, checkDeliverynoteOwnership,uploadMiddlewareMemory.single("image"), signDeliveryNote);
/**
 * @openapi
 * /api/deliverynote/{id}:
 *  delete:
 *      tags:
 *      - Delivery Note
 *      summary: Delete a delivery note
 *      description: Deletes a delivery note if it has not been signed. Returns an error if the note is already signed.
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: The ID of the delivery note to delete
 *      responses:
 *          '200':
 *              description: Delivery note deleted successfully
 *          '401':
 *              description: Unauthorized. The provided code is incorrect.
 *          '403':
 *              description: Delivery note does not belong to user or company
 *          '405':
 *              description: Cannot delete a signed delivery note
 *          '422':
 *              description: Validation error. The id provided does not match the mongo id format.
 *          '500':
 *              description: Internal Server Error
 */

router.delete('/:id', authMiddleware, validateIdParam, checkDeliverynoteOwnership, deleteDeliverynote)

module.exports = router; 