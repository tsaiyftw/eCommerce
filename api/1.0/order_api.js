const express = require("express")
const mysql = require("mysql2")
const router = express.Router();
require("dotenv").config()

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT

const SECRET = process.env.SECRET
const PARTNER_KEY = process.env.PARTNER_KEY
const MERCHANT_ID = process.env.MERCHANT_ID
const X_API_KEY = process.env.X_API_KEY

const pool = mysql.createPool({
    connectionLimit: 100,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT
});
const promisePool = pool.promise();


router.post('/order/checkout', async (req, res) => {

    const auth = req.headers.authorization
    if (!auth) {
        return res.status(401).json({ Error: "No token available!" })
    }

    const token = auth.replace('Bearer ', '')
    try {
        const { email } = jwt.verify(token, SECRET)
        const user = await getUser(email)
        console.log("Login successful.")
    } catch (error) {
        return res.status(403).json({ Error: "Token invalid!" + JSON.stringify(error) })
    }


    // check each field filled and corretness 
    const prime = req.body.prime
    if (!prime) {
        return res.status(400).json({ Error: "Prime field is required." })
    }
    // order info
    const order = req.body.order
    if (!order) {
        return res.status(400).json({ Error: "Order field is required." })
    }

    const shipping = req.body.order.shipping
    const payment = req.body.order.payment
    const subtotal = req.body.order.subtotal
    const freight = req.body.order.freight
    const total = req.body.order.total

    if (!req.body.order.recipient) {
        return res.status(400).json({ Error: "All recipient info fields are required." })
    }
    const name = req.body.order.recipient.name
    const phone = req.body.order.recipient.phone
    const email = req.body.order.recipient.email
    const address = req.body.order.recipient.address
    const time = req.body.order.recipient.time

    if (!req.body.order.list) {
        return res.status(400).json({ Error: "All list info fields are required." })
    }

    if (!shipping || !payment || !subtotal || !freight || !total || !name || !phone || !email || !address || !time) {
        return res.status(400).json({ Error: "All order info field are required." })
    }

    for (let i = 0; i < order.list.length; ++i) {
        if (!order.list[i].id || !order.list[i].name || !order.list[i].price || !order.list[i].color.name || !order.list[i].color.code || !order.list[i].size || !order.list[i].qty) {
            return res.status(400).json({ Error: "All order list field are required." })
        }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const valid = emailRegex.test(email);
    if (!valid)
        return res.status(400).json({ Error: "Please provide valid email." })

    // check Product, Stock
    for (let i = 0; i < order.list.length; ++i) {
        const [result, _] = await promisePool.execute(
            'SELECT Stock FROM variants WHERE PID = ? AND Size = ? AND Color_code = ? AND Color_name = ?',
            [order.list[i].id, order.list[i].size, order.list[i].color.code, order.list[i].color.name]
        );
        if (result == 0) {
            return res.status(400).json({ Error: "Product not found." })
        }
        else if (result[0].Stock < order.list[i].qty) {
            return res.status(400).json({ Error: "Stock of product not available." })
        }
    }

    // check Price and sum
    let sum = 0
    for (let i = 0; i < order.list.length; ++i) {
        const [resultPrice, _] = await promisePool.execute(
            'SELECT Price FROM products WHERE ProductID =?',
            [order.list[i].id]
        )
        if (resultPrice[0].Price !== order.list[i].price) {
            return res.status(400).json({ Error: "Product price not matched." })
        }
        let sumEach = resultPrice[0].Price * order.list[i].qty
        sum += sumEach
    }
    if (sum !== subtotal) {
        return res.status(400).json({ Error: "Subtotal amount not matched." })
    }

    // check list freight, list total
    if (freight !== 100) {
        return res.status(400).json({ Error: "Freight amount must be 100." })
    }
    const totalSum = freight + sum
    if (totalSum !== total) {
        return res.status(400).json({ Error: "Total amount not matched" })
    }

    // Create order
    async function createOrder(req) {
        const connection = await promisePool.getConnection();

        console.log("Start order transaction");

        await connection.beginTransaction();
        try {
            const [orderRows] = await connection.execute(
                'INSERT INTO orders(shipping, payment, subtotal, freight, total, name, phone, email, address, time, status) VALUES(?, ?,?,?,?,?,?,?,?,?,?)',
                [shipping, payment, subtotal, freight, total, name, phone, email, address, time, "unpaid"]
            )
            const oid = orderRows.insertId
            for (let i = 0; i < order.list.length; ++i) {
                await connection.execute(
                    'INSERT INTO list(oid, pid, productName, price, colorCode, colorName, size, qty) VALUES(?,?,?,?,?,?,?,?)',
                    [oid, order.list[i].id, order.list[i].name, order.list[i].price, order.list[i].color["name"], order.list[i].color["code"], order.list[i].size, order.list[i].qty]
                )
            }

            // TapPay payment 
            async function TPtransfer(req) {
                const post_data = {
                    "prime": req.body.prime,
                    "partner_key": PARTNER_KEY,
                    "merchant_id": MERCHANT_ID,
                    "amount": req.body.order.total,
                    "currency": "TWD",
                    "details": "stylish checkout",
                    "cardholder": {
                        "phone_number": req.body.order.recipient.phone,
                        "name": req.body.order.recipient.name,
                        "email": req.body.order.recipient.email
                    },
                    "remember": false
                }
                console.log("Post Data transfering to TP")
                const TPReturn = await axios.post('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', post_data, {
                    headers: {
                        'x-api-key': X_API_KEY
                    }
                })
                return TPReturn["data"]["status"]
            }

            console.log("Check payment status")
            const paymentStatus = await TPtransfer(req);
            console.log("Payment status: ", paymentStatus)
            if (paymentStatus !== 0) {
                throw new Error(`Payment is not successful.`)
            }

            await connection.execute(
                'UPDATE orders SET status= "paid" WHERE oid =?', [oid]
            );
            console.log(`Order created`);
            console.log('Order list: ', order.list)

            // Updata product stock number
            for (let i = 0; i < order.list.length; ++i) {
                await connection.execute(
                    'UPDATE variants SET Stock= Stock - ? WHERE PID = ? AND Size = ? AND Color_code = ? AND Color_name = ?',
                    [order.list[i].qty, order.list[i].id, order.list[i].size, order.list[i].color.code, order.list[i].color.name]
                )
            }

            await connection.commit();
            let retJson = { "number": oid }
            console.log("Order number: ", oid)
            return res.status(200).json({ "data": retJson });

        } catch (error) {
            console.error(`Error occurred while creating order: ${error.message}`, error);
            connection.rollback();
            console.info('Rollback successful');
            return res.status(400).json({ "Error": "Payment is not successful." });
        } finally {
            connection.release();
        }
    }
    createOrder(req);
});

exports.routes = router