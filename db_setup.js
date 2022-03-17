const sqlite3 = require('sqlite3')

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    } else {
        console.log('Created database.')
        db.run('DROP TABLE IF EXISTS user')
        db.run(`CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text UNIQUE, 
            password text)`
        );
        db.run(`INSERT INTO user (name, password) VALUES ("johan","202cb962ac59075b964b07152d234b70")`)
    }
});
