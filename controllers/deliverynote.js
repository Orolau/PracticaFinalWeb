const { clientModel, userModel, projectModel, deliverynoteModel } = require('../models/index.js');
const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError.js");

const createDeliverynote = async (req, res) => {
    try {
        const userId = req.user._id;
        req = matchedData(req)

        if (req.format === 'hours' && req.material)
            req.material = ""
        else if(req.format === 'material' && req.hours)
            req.hours = ""

        if (typeof req.hours === "string") {
            req.hours = [req.hours];
        }
        if (typeof req.materials === "string") {
            req.materials = [req.materials];
        }

        const body = { ...req, userId: userId }
        const deliverynote = await deliverynoteModel.create(body);
        res.send(deliverynote)

    } catch (err) {
        console.log(err)
        handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
    }
}

module.exports = {createDeliverynote}