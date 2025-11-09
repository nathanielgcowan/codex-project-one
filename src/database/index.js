const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database(path.join(__dirname, '../../db/todo.db'));

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Create todos table
            db.run(`CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                completed BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
}

// User operations
function createUser(username, password) {
    return new Promise((resolve, reject) => {
        const hashedPassword = bcrypt.hashSync(password, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

function getUser(username) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Todo operations
function createTodo(userId, title) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO todos (user_id, title) VALUES (?, ?)',
            [userId, title],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

function getTodos(userId) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
            [userId],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
}

function updateTodo(id, userId, completed) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?',
            [completed, id, userId],
            function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            }
        );
    });
}

function deleteTodo(id, userId) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM todos WHERE id = ? AND user_id = ?',
            [id, userId],
            function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            }
        );
    });
}

module.exports = {
    initializeDatabase,
    createUser,
    getUser,
    createTodo,
    getTodos,
    updateTodo,
    deleteTodo
};