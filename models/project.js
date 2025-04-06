const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete")

const ProjectScheme = new mongoose.Schema(
    {
        email:{
            type: String,
            example: "miCorreo@example.com"
        },
        name:{
            type: String,
            default: "Project Name"
        },
        projectCode:{
            type: String,
            example: "Id-proyect"
        },
        code:{
            type: String,
            example: "0001"
        },
        userId:{
            type: String,
            example: "6662afde03013916089bc058"
        },
        clientId:{
            type: String,
            example: "6662a8c3c199795c88329e4e"
        },
        address:{
            street: {type: String},
            number: {type: Number},
            city: {type: String},
            postal: {type: Number},
            province: {type: String},
        },
        begin:{
            type: String,
            example: "10-04-2025"
        },
        end:{
            type: String,
            example: "30-05-2025"
        },
        notes:{
            type: String,
            example: "This is a note"
        },
        servicePrices:{
            type: Array,
            default: []
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

ProjectScheme.plugin(mongooseDelete, {overrideMethods: "all"})
module.exports = mongoose.model("projectModel", ProjectScheme)