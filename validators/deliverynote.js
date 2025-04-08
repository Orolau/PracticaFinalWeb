const { check, body } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorCreateDeliveryNote = [
  check("clientId").exists().withMessage("clientId is required").isMongoId().withMessage("Invalid clientId"),
  check("projectId").exists().withMessage("projectId is required").isMongoId().withMessage("Invalid projectId"),
  check("description").exists().withMessage("description is required").isString().withMessage("Description must be a string"),
  check("workdate").optional().isString().withMessage("workdate must be a string"),
  check("format").optional().isIn(["hours", "material"]).withMessage("format must be 'hours' or 'material'"),
  check("material").optional(),
  check("hours").optional(),

  validateResults,
];

module.exports = { validatorCreateDeliveryNote };
