import sqlite3 from 'sqlite3';
let sql;
// connect to DB
const db = new sqlite3.Database('./test.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }
    else {
        //console.log('Connected to the database.');
    }
});
// Create users table if not exists
sql = `CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT,
            last_name TEXT,
            username TEXT UNIQUE,
            password TEXT,
            email TEXT UNIQUE
        )`;
db.run(sql, (err) => {
    if (err) {
        console.error(err.message);
    }
    else {
        //console.log('Table created or already exists.');
    }
});
export default db;
