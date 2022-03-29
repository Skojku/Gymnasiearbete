const sqlite3 = require('sqlite3').verbose()
const md5 = require('md5')

const DBSOURCE = "db2.sqlite"

// skapa en sqlitedatabas
let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    } else {
        console.log('Connected to the SQLite database.')
    }
})


async function get_inventory_by_userid(id) {
    var sql = 'SELECT itemtype, count FROM user JOIN hasitem ON user.id = hasitem.playerid WHERE user.id = ?'
    var params = [id]

    let myPromise = new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject({ "error": err.message })
            }
            resolve(rows)
        })
    })
    return await myPromise
}

async function get_user_by_id(id) {
    var sql = 'SELECT name, screen, x, y FROM user WHERE id = ?'
    var params = [id]

    let myPromise = new Promise((resolve, reject) => {
        db.get(sql, params, (err, res) => {
            if (err) {
                reject({ "error": err.message })
            }
            resolve(res)
        })
    })
    return await myPromise
}

async function get_all_users() {
    var sql = "SELECT * FROM user"
    var params = []

    let myPromise = new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject({ "error": err.message })
            }
            resolve(rows)
        })
    })

    return await myPromise
}

async function create_user(username, password, password2) {
    let myPromise = new Promise((resolve, reject) => {
        var errors = []
        if (!username || !password || !password2) {
            errors.push("Please fill out all fields");
        }
        if (password !== password2) {
            errors.push("The passwords do not match");
        }
        if (errors.length) {
            reject(errors)
        }
        var data = {
            name: username,
            password: md5(password)
        }
    
        var sql = 'INSERT INTO user (name, password) VALUES (?,?)'
        var params = [data.name, data.password]
        user_in_db(data)
            .then(() => {
                db.run(sql, params, (err, result) => {
                    if (err) {
                        reject({ "error": err.message });
                    }
                    resolve('User created')
                })
            })
            .catch(() => {
                reject('Username already taken')
            })
    })

    return await myPromise
}

async function update_user(user) {
    // console.log(user);
    var sql_user = 'UPDATE user SET x = ?, y = ?, screen = ? WHERE id = ?' 
    var sql_inventory = 'INSERT INTO hasitem (playerid, itemtype, count) VALUES (?, ?, ?)'
    let myPromise = new Promise((resolve, reject) => {
        db.run(sql_user, [user.x, user.y, user.screen, user.id], (err, result) => {
            if (err) {
                reject({ "error": err.message })
            }
            db.run('DELETE FROM hasitem WHERE playerid = ?', [user.id], (err, result) => {
                if (err) {
                    reject({ "error": err.message })
                }
                for (const type in user.inventory) {
                    db.run(sql_inventory, [user.id, type, user.inventory[type]], (err, result) => {
                        if (err) {
                            reject({ "error": err.message })
                        }
                        resolve('Updated user')
                    })
                }
            })
        })
    })

    return await myPromise
}

async function user_in_db(user) {
    let myPromise = new Promise((resolve, reject) => {
        get_all_users()
            .then(users => {
                users.forEach(u => {
                    if (u.name === user.name) {
                        reject()
                    }
                })
                resolve()
            })
    })

    return await myPromise
}

module.exports = { get_all_users, create_user, update_user, get_user_by_id, get_inventory_by_userid }