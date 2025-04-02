const express = require("express");
const router = express.Router();
const { createUser, verifyCode, login, addPersonalUserData, addCompanyUserData, uploadLogo, getUser, deleteUser, createGuestUser, recoverToken, validationToRecoverPassword, changePassword, addAddressUserData } = require("../controllers/user.js");
const {validatorRegisterUser, guestValidator, validateCode, validatorLogin,validatorPassword, validatorPersonalData, validatorCompanyData, validatorRecoverToken, validatorCodeToChangePassword, validatorAdressData} = require("../validators/user.js");
const authMiddleware = require("../middleware/session.js");
const { uploadMiddlewareMemory } = require("../utils/handleStorage.js");
const checkUniqueCIF = require("../middleware/checkUniqueCif.js");

/**
 * @openapi
 * /api/user/register:
 *  post:
 *      tags:
 *      - User
 *      summary: User register
 *      description: Register a new user
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/userDataLogin"
 *      responses:
 *          '200':
 *              description: Ok. Returns the inserted object and JWT Token
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userDataWithToken"
 *          '409':
 *              description: User exists
 *          '422':
 *              description: Validation error. The request body contains invalid fields
 *          '500':
 *              description: Internal Server Error
 */
router.post('/register', validatorRegisterUser, createUser);
/**
 * @openapi
 * /api/user/validation:
 *  put:
 *      tags:
 *      - User
 *      summary: Validate's the user mail
 *      description: Validate's the user mail
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/code"
 *      responses:
 *          '200':
 *              description: Ok. Changes status field to 1 and returns an object with acknowledged to true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userAllData"
 *          '400':
 *              description: Code not valid
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid
 *          '422':
 *              description: Validation error. The request body contains invalid fields
 *          '500':
 *              description: Internal Server Error
 */
router.put('/validation', authMiddleware, validateCode, verifyCode);
/**
 * @openapi
 * /api/user/login:
 *  post:
 *      tags:
 *      - User
 *      summary: Login User
 *      description: Login a user with email and password
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/userDataLogin"
 *      responses:
 *          '200':
 *              description: Ok. Returns the JWT Token.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userData"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid
 *          '404':
 *              description: User is not found
 *          '422':
 *              description: Validation error. The request body contains invalid fields
 *          '500':
 *              description: Internal Server Error
 */
router.post('/login', validatorLogin, login );
/**
 * @openapi
 * /api/user/register:
 *  patch:
 *      tags:
 *      - User
 *      summary: User Registration Completed
 *      description: Register a new user with all required data
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/personalDataUser"
 *      responses:
 *          '200':
 *              description: Ok. Returns the JWT Token.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userAllData"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid
 *          '404':
 *              description: User is not found
 *          '422':
 *              description: Validation error. The request body contains invalid fields
 *          '500':
 *              description: Internal Server Error
 */
router.patch('/register', authMiddleware, validatorPersonalData, addPersonalUserData);
/**
 * @openapi
 * /api/user/company:
 *  patch:
 *      tags:
 *      - User
 *      summary: Adding user company
 *      description: Adds user company
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/userCompany"
 *      responses:
 *          '200':
 *              description: OK. Set the company object and returns the object.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userAllData"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid
 *          '404':
 *              description: User is not found
 *          '409':
 *              description: Company already exists. 
 *          '422':
 *              description: Validation error. The request body contains invalid fields
 *          '500':
 *              description: Internal Server Error
 */
router.patch('/company', authMiddleware, checkUniqueCIF, validatorCompanyData, addCompanyUserData);
/**
 * @openapi
 * /api/user/address:
 *  patch:
 *      tags:
 *      - User
 *      summary: Adding user address
 *      description: Adds user address
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/userAddress"
 *      responses:
 *          '200':
 *              description: OK. Set the address object and returns the object.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userAllData"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid
 *          '404':
 *              description: User is not found
 *          '422':
 *              description: Validation error. The request body contains invalid fields
 *          '500':
 *              description: Internal Server Error
 */
router.patch('/address', authMiddleware, validatorAdressData, addAddressUserData);
/**
 * @openapi
 * /api/user/logo:
 *  patch:
 *      tags:
 *      - User
 *      summary: Upload user logo
 *      description: Uploads a user profile logo to IPFS via Pinata and updates the user's profile with the file URL.
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          file:
 *                              type: string
 *                              format: binary
 *                              description: The image file to be uploaded
 *      responses:
 *          '200':
 *              description: OK. Updates the user's logo URL and returns the updated user object.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userAllData"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid.
 *          '500':
 *              description: Internal Server Error.
 */

router.patch('/logo', authMiddleware, uploadMiddlewareMemory.single("image"), uploadLogo);
/**
 * @openapi
 * /api/user:
 *  get:
 *      tags:
 *      - User
 *      summary: Get user data
 *      description: Retrieves the authenticated user's information.
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          '200':
 *              description: OK. Returns the authenticated user's data.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userAllData"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid.
 *          '500':
 *              description: Internal Server Error.
 */

router.get('/', authMiddleware, getUser);
/**
 * @openapi
 * /api/user:
 *  delete:
 *      tags:
 *      - User
 *      summary: Delete user account
 *      description: Deletes the authenticated user's account. Supports both soft and hard deletion.
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: query
 *            name: soft
 *            schema:
 *                type: boolean
 *            required: false
 *            description: If true, performs a soft delete (marks user as deleted instead of removing it from the database).
 *      responses:
 *          '200':
 *              description: OK. User deleted successfully.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  example: "User soft deleted successfully"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid.
 *          '404':
 *              description: User not found.
 *          '500':
 *              description: Internal Server Error.
 */

router.delete('/', authMiddleware, deleteUser);
/**
 * @openapi
 * /api/user/invite:
 *  post:
 *      tags:
 *      - User
 *      summary: Create a guest user
 *      description: Creates a new guest user associated with the authenticated user's company.
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/guestDataRegister"
 *      responses:
 *          '200':
 *              description: OK. Guest user created successfully.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userData"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid.
 *          '409':
 *              description: Conflict. User already exists.
 *          '500':
 *              description: Internal Server Error.
 */

router.post('/invite', authMiddleware, guestValidator, createGuestUser);
/**
 * @openapi
 * /api/user/recover:
 *  post:
 *      tags:
 *      - User
 *      summary: Generate a recovery token
 *      description: Generates a recovery code for the user associated with the provided email.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/email"
 *      responses:
 *          '200':
 *              description: OK. Recovery token generated successfully.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userRecoverToken"
 *          '404':
 *              description: User email not found.
 *          '409':
 *              description: User is not validated.
 *          '422':
 *              description: Validation error. The request body contains invalid fields.
 *          '500':
 *              description: Internal Server Error.
 */

router.post('/recover', validatorRecoverToken, recoverToken);
/**
 * @openapi
 * /api/user/validation:
 *  post:
 *      tags:
 *      - User
 *      summary: Validate recovery code and return token
 *      description: Validates the recovery code sent to the user's email and returns an authentication token if valid.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/validateCode"
 *      responses:
 *          '200':
 *              description: OK. Recovery code validated successfully, token returned.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userDataWithToken"
 *          '401':
 *              description: Unauthorized. The provided code is incorrect.
 *          '404':
 *              description: User not found.
 *          '422':
 *              description: Validation error. The request body contains invalid fields.
 *          '500':
 *              description: Internal Server Error.
 */

router.post('/validation', validatorCodeToChangePassword, validationToRecoverPassword);
/**
 * @openapi
 * /api/user/password:
 *  patch:
 *      tags:
 *      - User
 *      summary: Change user password
 *      description: Updates the authenticated user's password.
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/password"
 *      responses:
 *          '200':
 *              description: OK. Password changed successfully.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  example: "Password changed successfully"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid.
 *          '404':
 *              description: User not found.
 *          '422':
 *              description: Validation error. The request body contains invalid fields.
 *          '500':
 *              description: Internal Server Error.
 */

router.patch('/password', authMiddleware, validatorPassword, changePassword);

module.exports = router; 