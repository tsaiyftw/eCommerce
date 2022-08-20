const express = require("express")
const mysql = require("mysql2")
const router = express.Router();
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

require("dotenv").config()

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT
const JWT_DURATION = 600000 // seconds
const SALT_ROUNDS = 10;
const SECRET = process.env.SECRET

const pool = mysql.createPool({
    connectionLimit: 100,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT
});
const promisePool = pool.promise();



// User endpoints
async function getUser(email) {
    const queryUsers = `SELECT id, provider, name, email, picture FROM users WHERE email=?`
    const [users] = await promisePool.execute(queryUsers, [email]);
    return users[0]
}

function prepareUserReply(user) {
    const userBasicInfo = {
        "name": user.name,
        "email": user.email
    }
    try {
        const token = jwt.sign(userBasicInfo, SECRET, { expiresIn: `${JWT_DURATION} sec` })
        const data = {};
        data["user"] = JSON.parse(JSON.stringify(user));
        data["user"] = user;
        data["access_token"] = token;
        data["access_expired"] = JWT_DURATION;
        return { "code": 200, "comment": { "data": data } }

    } catch (error) {
        return { "code": 500, "comment": "Error when prepare data: " + error }
    }
}

// user sign up
router.post('/user/signup', (req, res) => {

    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const provider = "native"

    if (!name || !email || !password) {
        return res.status(400).send("Name, email, password are required.")
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const valid = emailRegex.test(email);
    if (!valid)
        return res.status(400).send("Please provide valid email.")

    async function checkEmail(email) {
        const sql = `SELECT id FROM users WHERE email=?`
        const [result, _] = await promisePool.execute(sql, [email])
        return result.length == 0
    }

    async function insertNewUser(res, name, email, password, provider) {
        const notExist = await checkEmail(email)
        if (!notExist) {
            return { "code": 403, "comment": "Email already existed." }
        }
        try {

            const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);
            const insertSql = `INSERT INTO users (name, email, password, provider) VALUES (?, ?, ?, ?)`
            await promisePool.execute(insertSql, [name, email, hashPassword, "native"])

            const user = await getUser(email);

            return prepareUserReply(user)
        } catch (error) {
            return { "code": 500, "comment": "Error happened in db processing: " + error }
        }

    }

    insertNewUser(res, name, email, password, provider).then((result) =>
        res.status(result.code).send(result.comment)).catch((err) => res.send(err))
});


// user sign in 
router.post('/user/signin', (req, res) => {
    const provider = req.body.provider
    if (provider == "native") {
        const email = req.body.email
        const passwordInput = req.body.password

        if (!email || !passwordInput) {
            return res.status(400).send("Email and password are required.")
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const valid = emailRegex.test(email);
        if (!valid)
            return res.status(400).send("Please provide valid email.")

        async function getPassword(email, passwordInput) {
            const sql = `SELECT password FROM users WHERE email=?`
            const [result, _] = await promisePool.execute(sql, [email])

            if (result.length == 0) {
                return { "code": 403, "comment": "Email not registered!" }
            }

            const passwordDB = result[0].password
            const passwordValid = await bcrypt.compare(passwordInput, passwordDB);
            if (!passwordValid) {
                return { "code": 403, "comment": "Incorrect password!" }
            }

            const user = await getUser(email);

            return prepareUserReply(user)
        }

        getPassword(email, passwordInput).then((result) =>
            res.status(result.code).send(result.comment))
            .catch((err) => { res.end(err) })


    } else if (provider == "facebook") {
        const access_token = req.body.access_token
        if (!access_token) {
            return res.status(400).send("No token available!")
        }
        async function getFBUser(access_token) {
            const response = await axios.get(`https://graph.facebook.com/v14.0/me?fields=id%2Cname%2Cemail&access_token=${access_token}`);

            const id = response.data.id
            const name = response.data.name
            const email = response.data.email

            const sql = `SELECT id FROM users where email=?`
            const [result, _] = await promisePool.execute(sql, [email])

            // not registered yet
            if (result.length == 0) {
                const insertSql = `INSERT INTO users (name, email, id, provider) VALUES (?, ?, ?, ?)`
                await promisePool.execute(insertSql, [name, email, id, provider])
                const user = await getUser(email);
                return prepareUserReply(user);
                // registered before
            } else {
                const user = await getUser(email);
                return prepareUserReply(user)
            }
        }
        getFBUser(access_token).then((result) =>
            res.status(result.code).send(result.comment)).catch((err) => res.send(err));
    } else {
        return res.status(400).send("Unsupported login method!");
    };
});

/// user profile
router.get('/user/profile', (req, res) => {

    const auth = req.header('Authorization')
    if (!auth) {
        return res.status(401).send("No token available!")
    }
    const token = auth.replace('Bearer ', '')

    async function getProfile(token) {
        try {
            const { email } = jwt.verify(token, SECRET)
            const user = await getUser(email)

            if (user.id) { delete user.id }

            return { "code": 200, "comment": { "data": user } }
        } catch (error) {
            return { "code": 403, "comment": "Token invalid: " + error }
        }
    }

    getProfile(token).then((result) =>
        res.status(result.code).send(result.comment)
    ).catch((err) => { res.end(err) })
})

exports.routes = router;