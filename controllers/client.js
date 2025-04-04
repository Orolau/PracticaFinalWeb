const { clientModel } = require('../models/index.js');
const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError.js");

const createClient = async (req, res) =>{
    try{
        const user = req.user;
        req = matchedData(req)
        const body = {...req, userId: user._id, logo:"", email:""}
        const clientData = await clientModel.create(body)
        res.send(clientData)

    }catch(err){
        handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
    }
}



module.exports = { createClient}