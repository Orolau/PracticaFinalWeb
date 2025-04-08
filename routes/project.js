const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/session.js");
const checkProjectExistence = require("../middleware/checkProjectExistence.js");
const { validatorCreateProject, validatorUpdateProject } = require("../validators/project.js");
const { createProject, updateProject, getProjects, getProjectById, deleteProject, archiveProject, getArchivedProjects, restoreProject } = require("../controllers/project.js");
const { validateIdParam } = require("../validators/client.js");
const checkProjectOwnership = require("../middleware/checkProjectOwnership.js");
const checkProjectDeletedOwnership = require("../middleware/checkProjectDeletedOwnership.js");

/**
 * @openapi
 * /api/project:
 *  post:
 *      tags:
 *      - Project
 *      summary: Create a new project
 *      description: Create a new project associated with the logged-in user. Name or code must be unique for the user or company.
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/projectData"
 *      responses:
 *          '200':
 *              description: Project created successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/allProjectData"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid
 *          '409':
 *              description: A project with the same name or code already exists in your company
 *          '422':
 *              description: Validation error. The request body contains invalid fields
 *          '500':
 *              description: Internal Server Error
 */

router.post('/', authMiddleware, checkProjectExistence, validatorCreateProject, createProject);
/**
 * @openapi
 * /api/project/{id}:
 *  put:
 *      tags:
 *      - Project
 *      summary: Update project
 *      description: Update a project. Name or code must remain unique for the user or company.
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/allProjectData"
 *      responses:
 *          '200':
 *              description: Project updated successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/allProjectData"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid
 *          '403':
 *              description: Project does not belong to user or company
 *          '404':
 *              description: Project not found
 *          '409':
 *              description: A project with the same name or code already exists in your company
 *          '422':
 *              description: Validation error. The request body contains invalid fields
 *          '500':
 *              description: Internal Server Error
 */

router.put('/:id', authMiddleware, validateIdParam, validatorUpdateProject, checkProjectOwnership, updateProject);
/**
 * @openapi
 * /api/project:
 *  get:
 *      tags:
 *      - Project
 *      summary: Get all projects
 *      description: Get all projects associated with the logged-in user and their company (if any).
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          '200':
 *              description: List of projects
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: "#/components/schemas/allProjectData"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid
 *          '500':
 *              description: Internal Server Error
 */

router.get('/', authMiddleware, getProjects);
/**
 * @openapi
 * /api/project/archive:
 *  get:
 *      tags:
 *      - Project
 *      summary: Get archived projects
 *      description: Get archived (soft-deleted) projects of the logged-in user and their company.
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          '200':
 *              description: Archived projects retrieved
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: "#/components/schemas/allProjectData"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid
 *          '500':
 *              description: Internal Server Error
 */
router.get('/archive', authMiddleware, getArchivedProjects);
/**
 * @openapi
 * /api/project/{id}:
 *  get:
 *      tags:
 *      - Project
 *      summary: Get project by ID
 *      description: Get a project by its ID. Only accessible by its owner or company.
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
 *              description: Project data
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/allProjectData"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid
 *          '403':
 *              description: Project does not belong to user or company
 *          '404':
 *              description: Project not found
 *          '500':
 *              description: Internal Server Error
 */

router.get('/:id', authMiddleware, validateIdParam, checkProjectOwnership, getProjectById);
/**
 * @openapi
 * /api/project/{id}:
 *  delete:
 *      tags:
 *      - Project
 *      summary: Delete a project
 *      description: Permanently delete a project by ID. Only accessible by its owner or company.
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
 *              description: Project deleted successfully
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid
 *          '403':
 *              description: Project does not belong to user or company
 *          '404':
 *              description: Project not found
 *          '500':
 *              description: Internal Server Error
 */

router.delete('/:id', authMiddleware, validateIdParam, checkProjectOwnership, deleteProject);
/**
 * @openapi
 * /api/project/archive/{id}:
 *  delete:
 *      tags:
 *      - Project
 *      summary: Archive a project
 *      description: Soft delete (archive) a project by ID. Only accessible by its owner or company.
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
 *              description: Project archived successfully
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid
 *          '403':
 *              description: Project does not belong to user or company
 *          '404':
 *              description: Project not found
 *          '500':
 *              description: Internal Server Error
 */

router.delete('/archive/:id', authMiddleware, validateIdParam, checkProjectOwnership, archiveProject);
/**
 * @openapi
 * /api/project/archive/{id}:
 *  patch:
 *      tags:
 *      - Project
 *      summary: Restore an archived project
 *      description: Restore a previously archived (soft-deleted) project by ID.
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
 *              description: Project restored successfully
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid
 *          '403':
 *              description: Project does not belong to user or company
 *          '404':
 *              description: Archived project not found
 *          '500':
 *              description: Internal Server Error
 */

router.patch('/archive/:id', authMiddleware, validateIdParam, checkProjectDeletedOwnership, restoreProject)


module.exports = router;