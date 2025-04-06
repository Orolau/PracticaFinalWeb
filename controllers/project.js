const { clientModel, userModel, projectModel } = require('../models/index.js');
const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError.js");

const createProject =  async (req, res) => {
    try {
        const user = req.user;
        req = matchedData(req)
        const body = { ...req, userId: user._id}
        const projectData = await projectModel.create(body)
        res.send(projectData)

    } catch (err) {
        handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
    }
}

const updateProject =  async (req, res) => {
    try {
        const {id} = req.params;
        req = matchedData(req)
        const projectData = await projectModel.findOneAndUpdate({ "_id": id }, req, { new: true })
        res.send(projectData)

    } catch (err) {
        handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500)
    }
}

module.exports = {createProject, updateProject}