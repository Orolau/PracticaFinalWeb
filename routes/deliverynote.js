const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/session.js");
const { validatorCreateDeliveryNote } = require("../validators/deliverynote.js");
const { createDeliverynote, getDeliverynotes } = require("../controllers/deliverynote.js");

router.post('/', authMiddleware, validatorCreateDeliveryNote, createDeliverynote);
router.get('/', authMiddleware, getDeliverynotes);


module.exports = router; 