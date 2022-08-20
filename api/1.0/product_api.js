const express = require("express")
const mysql = require("mysql2")
const router = express.Router();
require("dotenv").config()

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT

const PAGE_SIZE = 6;
const pool = mysql.createPool({
    connectionLimit: 100,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT
});
const promisePool = pool.promise();

async function getAllProducts(kind, keyword, id, offset) {
    let sql = `SELECT ProductID as id, 
    Category as category,
    Title as title,
    Description as description,
    Price as price,
    Texture as texture,
    Wash as wash,
    Place as place,
    Note as note,
    Story as story,
    Main_image as main_image,
    Image_0,
    Image_1,
    Image_2
    FROM products`;
    if (kind != "") {
        sql += (' WHERE Category = "' + kind + '"');
    }
    if (keyword != "") {
        sql += (' WHERE Title like "' + keyword + '"');
    }
    if (id != "") {
        sql += (' WHERE ProductID = "' + id + '"');
    }
    sql += ' LIMIT ' + offset + ',' + PAGE_SIZE + ';'

    const [rows, _] = await promisePool.execute(sql)
    for (let row of rows) {
        let images = []
        images.push(row.Image_0)
        images.push(row.Image_1)
        images.push(row.Image_2)
        row["images"] = images
        delete row.Image_0
        delete row.Image_1
        delete row.Image_2
    }
    return rows
}

async function getVariants(pid) {
    let sql = `SELECT Stock as stock, Color_code as color_code, Size as size FROM 
    variants WHERE pid=?`;
    const [rows, _] = await promisePool.execute(sql, [pid])
    return rows
}

async function getSizes(pid) {
    let sql = `SELECT DISTINCT Size FROM 
    variants WHERE pid=?`;
    const [rows, _] = await promisePool.execute(sql, [pid])
    // convert to array
    const ret = []
    for (row of rows) {
        ret.push(row.Size)
    }
    return ret
}

async function getColors(pid) {
    let sql = `SELECT DISTINCT Color_code as code, Color_name as name FROM 
    variants WHERE pid=?`;
    const [rows, _] = await promisePool.execute(sql, [pid])
    return rows
}

async function getAll(res, kind, keyword, id, offset) {
    const allProducts = await getAllProducts(kind, keyword, id, offset)
    for (product of allProducts) {
        const pid = product.id;
        const colors = await getColors(pid);
        const sizes = await getSizes(pid);
        const vairants = await getVariants(pid);

        product["colors"] = colors;
        product["sizes"] = sizes;
        product["variants"] = vairants;
    }

    const retJson = {};
    retJson["data"] = allProducts;
    if (allProducts.length >= PAGE_SIZE) {
        retJson["next_paging"] = (offset / 6) + 1
    }
    if (id != "") {
        let removedEL = retJson["data"].pop()
        res.send({ data: removedEL })
    }
    else {
        res.send(retJson)
    }
}

router.get(`/products/all`, (req, res) => {
    let { paging } = req.query
    if (!paging) {
        paging = 0;
    }
    else {
        if (paging.includes(".")) {
            return res.send("Please provide proper paging number")
        }
        else {
            let n = parseInt(paging)
            if (isNaN(n)) {
                return res.send("Please provide proper paging number ")
            } else if (n < 0) {
                return res.send("Please provide proper paging numberr")
            }
        }
    }
    getAll(res, "", "", "", paging * PAGE_SIZE);
});

// create other categories

router.get(`/products/women`, (req, res) => {
    let { paging } = req.query
    if (!paging) {
        paging = 0;
    }
    else {
        if (paging.includes(".")) {
            return res.send("Please provide proper paging number")

        }
        else {
            let n = parseInt(paging)
            if (isNaN(n)) {
                return res.send("Please provide proper paging number ")
            } else if (n < 0) {
                return res.send("Please provide proper paging numberr")
            }
        }
    }
    getAll(res, "women", "", "", paging * PAGE_SIZE);
});

router.get(`/products/men`, (req, res) => {
    let { paging } = req.query
    if (!paging) {
        paging = 0;
    }
    else {
        if (paging.includes(".")) {
            return res.send("Please provide proper paging number")

        }
        else {
            let n = parseInt(paging)
            if (isNaN(n)) {
                return res.send("Please provide proper paging number ")
            } else if (n < 0) {
                return res.send("Please provide proper paging numberr")
            }
        }
    }
    getAll(res, "men", "", "", paging * PAGE_SIZE);
});

router.get(`/products/accessories`, (req, res) => {
    let { paging } = req.query
    if (!paging) {
        paging = 0;
    }
    else {
        if (paging.includes(".")) {
            return res.send("Please provide proper paging number")

        }
        else {
            let n = parseInt(paging)
            if (isNaN(n)) {
                return res.send("Please provide proper paging number ")
            } else if (n < 0) {
                return res.send("Please provide proper paging numberr")
            }
        }
    }
    getAll(res, "accessories", "", "", paging * PAGE_SIZE);
});

// create search function for searching title
router.get(`/products/search`, (req, res) => {
    let { keyword, paging } = req.query
    if (!keyword) {
        res.send("You have to provide keyword to serach");
        return
    }
    if (!paging) {
        paging = 0;
    }
    keyword = `%${keyword}%`
    getAll(res, "", keyword, "", paging * PAGE_SIZE);
});

// create looking for id function 
router.get(`/products/details`, (req, res) => {
    const { id } = req.query
    getAll(res, "", "", id, 0);

});

exports.routes = router;