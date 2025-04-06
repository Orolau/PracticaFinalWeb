const {check, param} = require ("express-validator")
const validateResults = require("../utils/handleValidator")

const validatorCreateProject = [
    check("name").exists().withMessage("No name").notEmpty().withMessage("No valid name"),
    check("projectCode").exists().withMessage("No project code").notEmpty().withMessage("No valid project code"),
    check("clientId").exists().withMessage("No client id").isMongoId().withMessage("No valid client id"),
    check("code").optional().isString().withMessage("Code must be a string"),
    check("address").optional(),
    check("address.street").optional().isString().withMessage("Street must be a string"),
    check("address.province").optional().isString().withMessage("Province must be a string"),
    check("address.city").optional().isString().withMessage("City must be a string"),
    check("address.number").optional().isInt().withMessage("Number must be a integer"),
    check("address.postal").optional().isInt().withMessage("Postal must be a integer"),
    validateResults
];

module.exports={validatorCreateProject}