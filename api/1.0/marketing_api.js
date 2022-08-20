const express = require("express")
const mysql = require("mysql2")
const router = express.Router();
require("dotenv").config()

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT

const pool = mysql.createPool({
    connectionLimit: 100,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT
});
const promisePool = pool.promise();

router.get('/marketing/campaigns', (req, res) => {
    async function getProducts(res) {
        let sql = `SELECT * FROM campaigns`;
        const [rows, _] = await promisePool.execute(sql)
        const ret = []
        for (row of rows) {
            const keys = Reflect.ownKeys(row);
            if (keys.length) delete row[keys[0]]
        }
        console.log(rows)

        const retJson = {};
        retJson["data"] = rows;

        res.send(retJson)
    }
    getProducts(res);
});

exports.routes = router;