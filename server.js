const express = require("express")
const app = express()
const path = require("path")
const mysql = require("mysql2")
const multer = require("multer")
const bodyParser = require("body-parser")
const jwt = require('jsonwebtoken')
const axios = require('axios').default;

require("dotenv").config()

API_VERSION = '1.0'

// api endpoints
const productAPI = require(`./api/${API_VERSION}/product_api.js`)
const userAPI = require(`./api/${API_VERSION}/user_api.js`)
const orderAPI = require(`./api/${API_VERSION}/order_api.js`)
const marketingAPI = require(`./api/${API_VERSION}/marketing_api.js`)

// manage endpoints
const adminManage = require("./admin.js")


app.set("view-engine", "ejs")
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/', express.static(path.join(__dirname, 'public')));


app.use('/', adminManage.routes)
app.use(`/api/${API_VERSION}`, productAPI.routes)
app.use(`/api/${API_VERSION}`, userAPI.routes)
app.use(`/api/${API_VERSION}`, orderAPI.routes)
app.use(`/api/${API_VERSION}`, marketingAPI.routes)


const SEVER_PORT = process.env.PORT;

app.listen(SEVER_PORT, () => {
    console.log(`Server started on port ${SEVER_PORT}...`)
});

app.get("/public/facebook.html", (req, res) => {
    res.sendFile("./public/facebook.html", { root: __dirname });
});

app.get("/public/index.html", (req, res) => {
    res.sendFile("./public/index.html", { root: __dirname });
});

app.get("/public/sign.html", (req, res) => {
    res.sendFile("./public/sign.html", { root: __dirname });
});

app.get("/public/profile.html", (req, res) => {
    res.sendFile("./public/profile.html", { root: __dirname });
});

app.get("", (req, res) => {
    res.send("Page not found!")
});
