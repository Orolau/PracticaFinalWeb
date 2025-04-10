const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/session.js");
const { validatorCreateDeliveryNote } = require("../validators/deliverynote.js");
const { createDeliverynote, getDeliverynotes, getDeliverynoteById, getDeliverynotePDF, signDeliveryNote } = require("../controllers/deliverynote.js");
const checkDeliverynoteOwnership = require("../middleware/checkDeliverynoteOwnership.js");
const { uploadMiddlewareMemory } = require("../utils/handleStorage.js");

router.post('/', authMiddleware, validatorCreateDeliveryNote, createDeliverynote);
router.get('/', authMiddleware, getDeliverynotes);
router.get('/:id', authMiddleware, checkDeliverynoteOwnership, getDeliverynoteById);
router.get('/pdf/:id', authMiddleware, checkDeliverynoteOwnership, getDeliverynotePDF);
router.patch('/sign/:id', authMiddleware, checkDeliverynoteOwnership,uploadMiddlewareMemory.single("image"), signDeliveryNote);

module.exports = router; 