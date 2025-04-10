const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete")

const DeliverynoteScheme = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clientModel",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projectModel",
      required: true,
    },
    format: {
      type: String,
      enum: ["hours", "material"],
      default: "hours",
    },
    hours: {
      type: [String],
      default: [],
    },
    materials:{
      type: [String],
      default: [],
    },
    pdf: {
      type: String
    },
    pending: {
      type: Boolean,
      default: false
    },
    sign: {
      type: String
    },
    description: {
      type: String
    },
    workdate: {
      type: String
    },
    deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

DeliverynoteScheme.plugin(mongooseDelete, { overrideMethods: "all" })
module.exports = mongoose.model("deliverynoteModel", DeliverynoteScheme)