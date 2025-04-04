const express = require("express")
const cors = require("cors");
require('dotenv').config();
const dbConnect = require("./config/mongo.js");
const router = require('./routes/index.js')
const morganBody = require("morgan-body")
const loggerStream = require ('./utils/handleLogger.js')
const swaggerUi = require("swagger-ui-express")
const swaggerSpecs = require("./docs/swagger")

const app = express();

morganBody(app, {
    noColors: true,
    skip: function (req, res) {
        return res.statusCode < 500
    },
    stream: loggerStream
})

app.use(cors());
app.use(express.json())
app.use("/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs)
)

app.use("/api", router);

const port = process.env.PORT || 3000;

const server = app.listen(port, () =>{
    //console.log("Servidor escuchando en el puerto " + port);
    dbConnect();
})

module.exports = {app, server};