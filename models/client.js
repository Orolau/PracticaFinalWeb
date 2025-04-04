const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete")

const ClientScheme = new mongoose.Schema(
    {
        name:{
            type: String,
            default: ""
        },
        cif:{
            type: String,
            default: ""
        },
        logo: {
            type: String
        },
        address:{
            street: {type: String},
            number: {type: Number},
            city: {type: String},
            postal: {type: Number},
            province: {type: String},
        },
        userId:{
            type: String
        },
        deleted:{
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

ClientScheme.plugin(mongooseDelete, {overrideMethods: "all"})
module.exports = mongoose.model("clientModel", ClientScheme)