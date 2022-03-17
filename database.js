const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose()
const md5 = require('md5')

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    } else {
        console.log('Connected to the SQLite database.')
        db.run('DROP TABLE IF EXISTS user')
        db.run(`CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text UNIQUE, 
            password text)`
        );
        var insert = 'INSERT INTO user (name, password) VALUES (?,?)'
        db.run(insert, ["johan", md5("123")])
        db.run(insert, ["gun", md5("321")])
    }
});

router.use(express.urlencoded({ extended: false }))

//get all users
router.get("/users", (req, res) => {
    var sql = "SELECT * FROM user"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "data": rows
        })
    })
})

//get user by id
router.get("/user/:id", (req, res) => {
    var sql = "SELECT * FROM user WHERE id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "data": row
        })
    });
});

//add user
router.post("/user", (req, res) => {
    var errors = []
    if (!req.body.username || !req.body.password || !req.body.password2){
        errors.push("Please fill out all fields");
    }
    if (req.body.password !== req.body.password2){
        errors.push("The passwords do not match");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        name: req.body.username,
        password : md5(req.body.password)
    }
    var sql ='INSERT INTO user (name, password) VALUES (?,?)'
    var params =[data.name, data.password]
    db.run(sql, params, (err, result) => {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data
        })
    });
    console.log('create user');
})

module.exports = router