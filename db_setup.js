const sqlite3 = require('sqlite3')

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    } else {
        //console.log('0');
        //db.run('DROP TABLE IF EXISTS user')
        db.run(`CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text UNIQUE, 
            password text,
            screen INTEGER DEFAULT 1 NOT NULL, 
            x DOUBLE DEFAULT 200 NOT NULL,
            y DOUBLE DEFAULT 100 NOT NULL)`
        );

        //db.run('DROP TABLE IF EXISTS item')
        db.run(`CREATE TABLE IF NOT EXISTS item (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT)`
        ); 
        
        //db.run('DROP TABLE IF EXISTS hasitem')
        db.run(`CREATE TABLE IF NOT EXISTS hasitem (
            spelarid INTEGER,
            itemid INTEGER, 
            count INTEGER)`
        );

        console.log('Created database.')
        let insert = 'INSERT INTO item (type) VALUES '
        /* db.run(insert + '("rock")')
        db.run(insert + '("torch")')
        db.run(insert + '("brick")') */
    }
});
