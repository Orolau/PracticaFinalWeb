const {check, param} = require ("express-validator")
const validateResults = require("../utils/handleValidator")

const validatorCreateClient = [
    check("name").exists().withMessage("No name").notEmpty().withMessage("No valid name"),
    check("address").optional(),
    check("cif").optional().isString().withMessage("No valid cif"),
    check("address.street").optional().isString().withMessage("Street must be a string"),
    check("address.province").optional().isString().withMessage("Province must be a string"),
    check("address.city").optional().isString().withMessage("City must be a string"),
    check("address.number").optional().isInt().withMessage("Number must be a integer"),
    check("address.postal").optional().isInt().withMessage("Postal must be a integer"),
    validateResults
];

const validatorUpdateClient = [
    check("address").optional(),
    check("cif").optional().isString().withMessage("No valid cif"),
    check("address.street").optional().isString().withMessage("Street must be a string"),
    check("address.province").optional().isString().withMessage("Province must be a string"),
    check("address.city").optional().isString().withMessage("City must be a string"),
    check("address.number").optional().isInt().withMessage("Number must be a integer"),
    check("address.postal").optional().isInt().withMessage("Postal must be a integer"),
    validateResults
];

const validateIdParam = [
    param('id')
      .exists().withMessage('El parámetro id es requerido')
      .isMongoId().withMessage('El id debe ser un MongoID válido'),
      validateResults
  ];

module.exports = {validatorCreateClient, validatorUpdateClient, validateIdParam}