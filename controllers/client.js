const { clientModel, userModel } = require('../models/index.js');
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

const updateClient = async (req, res) =>{
    try{
        const {id} = req.params;
        req = matchedData(req);
        const data = await clientModel.findOneAndUpdate({"_id": id}, req, {new:true});
        res.send(data);
        
    }catch(err){
        handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
    }
}

const getClients = async (req, res) =>{
    try{
        const currentUserId = req.user._id;
        const companyCif = req.user.company?.cif;

        let userIdsToInclude = [currentUserId];
        if (companyCif) {
            const usersInCompany = await userModel.find({ "company.cif": companyCif }, "_id");
            const ids = usersInCompany.map(user => user._id.toString());
            userIdsToInclude = [...new Set([...userIdsToInclude, ...ids])];
        }
        const clients = await clientModel.find({ userId: { $in: userIdsToInclude } });

        res.send(clients)
    }catch(err){
        handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
    }
}

const getClientById = async  (req, res) =>{
    try{
        const client = req.client;
        res.send(client);
        
    }catch(err){
        handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
    }
}

const deleteClient = async (req, res) =>{
    try{
        const {id} = req.params
        await clientModel.deleteOne({_id: id})
        res.status(200).send({message: 'Client deleted successfully'})
    }catch(err){
        handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
    }
}

const archiveClient = async (req, res) =>{
    try{
        const {id} = req.params
        await clientModel.delete({_id: id})
        res.status(200).send({message: 'Client archived successfully'})
    }catch(err){
        handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
    }
}

const getArchivedClients = async (req, res) => {
    try {
        
      const currentUserId = req.user._id;
      const companyCif = req.user.company?.cif;
  
      let userIdsToInclude = [currentUserId];
      
      if (companyCif) {
        const usersInCompany = await userModel.find({ "company.cif": companyCif }, "_id");
        const ids = usersInCompany.map(user => user._id);
        userIdsToInclude = [...new Set([...userIdsToInclude, ...ids])];
      }
  
      const archivedClients = await clientModel.findDeleted({
        userId: { $in: userIdsToInclude }
      });
  
      res.send(archivedClients);
    } catch (err) {
        console.log(err)
      handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500);
    }
  };
  

module.exports = { createClient, updateClient, getClients, getClientById, 
    deleteClient, archiveClient, getArchivedClients}