const { clientModel, userModel, projectModel, deliverynoteModel } = require('../models/index.js');
const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError.js");
const { getDeliverynotePdf } = require('../utils/createDeliveryNotePDF.js');
const descargarPDFDesdeIPFS = require('../utils/descargarPDFdeIPFS.js');
const path = require('path');
const util = require('util');
const fs = require('fs');


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

const getDeliverynotes = async (req, res) =>{
    try{
        const {company} = req.query
        const user = req.user
        let userIds = [user._id]

        if (company === 'true'){
            const usersInCompany = await userModel.find(
                { "company.cif": user.company.cif },
                "_id"
              );
        
            userIds = usersInCompany.map((u) => u._id);
        }
        


        const deliverynotes = await deliverynoteModel.find({ userId: { $in: userIds } })
        res.send(deliverynotes)
    }catch (err){
        handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
    }
}

const getDeliverynoteById = async (req, res) =>{
    try{
        const {id} = req.params
        const deliverynote = await deliverynoteModel.findById(id)
            .populate("userId")
            .populate("clientId")
            .populate("projectId");

        res.send(deliverynote)

    }catch(err){
        handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
    }
}

const getDeliverynotePDF = async (req, res) =>{
    try{
        if(!req.deliverynote.pdf)
            await getDeliverynotePdf(req, res)
        await descargarPDFDesdeIPFS(req, res)

    }catch(err){
        console.log(err)
        handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
    }
}

module.exports = {createDeliverynote, getDeliverynotes, getDeliverynoteById, getDeliverynotePDF}