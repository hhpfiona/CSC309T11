require("dotenv").config();  

const express = require("express");
const routes = require("./routes");
const cors = require("cors");


const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true,         
        optionsSuccessStatus: 200,  
    })
);

app.use(express.json());
app.use('', routes);

module.exports = app;