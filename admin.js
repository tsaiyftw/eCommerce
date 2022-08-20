const express = require("express")
const mysql = require("mysql2")
const multer = require("multer")
const router = express.Router();
require("dotenv").config()

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT
const SERVER_IP = process.env.SERVER_IP
const productImgFolder = 'product_images'
const pool = mysql.createPool({
    connectionLimit: 100,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT
});
const promisePool = pool.promise();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/' + productImgFolder)
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split("/")[1];
        cb(null, file.fieldname + '-' + Date.now() + "." + ext)
    },
});

const upload = multer({ storage: storage })

const cpUpload = upload.fields([
    { name: 'main_imageInput', maxCount: 1 },
    { name: 'image_0_Input', maxCount: 1 },
    { name: 'image_1_Input', maxCount: 1 },
    { name: 'image_2_Input', maxCount: 1 }])

router.get("/admin/product.html", (req, res) => {
    res.sendFile("./admin/product.html", { root: __dirname });
});

router.get("/admin/campaign.html", (req, res) => {
    res.sendFile("./admin/campaign.html", { root: __dirname });
});

router.get("/admin/checkout.html", (req, res) => {
    res.sendFile("./admin/checkout.html", { root: __dirname });
});

router.post('/upload', cpUpload, function (req, res, next) {

    async function insertProduct(req) {
        const category = req.body.categoryInput
        const title = req.body.titleInput
        const description = req.body.descriptionInput
        const price = req.body.priceInput
        const texture = req.body.textureInput
        const wash = req.body.washInput
        const place = req.body.placeInput
        const note = req.body.noteInput
        const story = req.body.storyInput

        const sizes = req.body.sizeInput.split(",")
        const color_codes = req.body.color_codeInput.split(",")
        const color_names = req.body.color_nameInput.split(",")
        const stocks = req.body.stockInput.split(",")

        if (sizes.length != color_codes.length
            || color_codes.length != color_names.length
            || color_names.length != stocks.length) {
            throw ("Erorr! Size, Color code, Color name, Stock Number do not match! (must be same size)")
        }

        if (!req.files["main_imageInput"]) {
            throw ("Main Image is required!")
        }

        const image_main_origin = req.files["main_imageInput"][0]["filename"]
        const image_main = [SERVER_IP, productImgFolder, image_main_origin].join("/")

        let image_0 = "";
        let image_1 = "";
        let image_2 = "";

        if (req.files["image_0_Input"]) {
            const image_0_origin = req.files["image_0_Input"][0]["filename"]
            image_0 = [SERVER_IP, productImgFolder, image_0_origin].join("/")
        }

        if (req.files["image_1_Input"]) {
            const image_1_origin = req.files["image_1_Input"][0]["filename"]
            image_1 = [SERVER_IP, productImgFolder, image_1_origin].join("/")
        }

        if (req.files["image_2_Input"]) {
            const image_2_origin = req.files["image_2_Input"][0]["filename"]
            image_2 = [SERVER_IP, productImgFolder, image_2_origin].join("/")
        }

        const sqlProduct = `INSERT INTO products (Category, Title, Description, Price, Texture, Wash, Place,
        Note, Story, Main_image, Image_0, Image_1, Image_2) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const [productRows] = await promisePool.execute(sqlProduct,
            [category, title, description, price, texture, wash, place, note, story, image_main, image_0, image_1, image_2]);

        const pid = productRows.insertId;

        for (let i = 0; i < sizes.length; ++i) {

            const sqlInvariants = `INSERT INTO variants (PID, Stock, Color_code, Color_name, Size) VALUES 
            (?,?,?,?,?)`
            await promisePool.execute(sqlInvariants, [pid, stocks[i], color_codes[i], color_names[i], sizes[i]])
        }
        return "Product Insert OK!"
    }
    insertProduct(req).then((result) => res.send(result)).catch(error => res.send(error));

});

// marketing compaigns
const campaingUpload = upload.single('picture')

router.post('/uploadCompaign', campaingUpload, (req, res, next) => {
    const product_id = req.body.product_id
    const story = req.body.story
    const picture_origin = req.file["filename"]
    const picture = [SERVER_IP, productImgFolder, picture_origin].join("/")

    if (!product_id || !story || !picture_origin) {
        return "All fields are required."
    }
    async function checkPID(product_id) {
        const sql = `SELECT ProductID FROM products WHERE ProductID=?`
        const [result, _] = await promisePool.execute(sql, [product_id])
        return result.length == 0
    }

    async function insertCompaign(req) {
        const notExist = await checkPID(product_id)
        if (notExist) {
            return { "Info": "Product ID doesn't exitst. Please offer correct Product ID" }
        }
        const sqlCompaign = `INSERT INTO campaigns (product_id, story, picture) VALUES (?,?,?)`;
        const [row] = await promisePool.execute(sqlCompaign, [product_id, story, picture]);

        return "Compaign Insert OK!"
    }
    insertCompaign(req).then((result) => res.send(result)).catch(error => res.send(error));
});

exports.routes = router;