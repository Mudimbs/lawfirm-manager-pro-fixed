/**
 * db.js - SQLite initialisation & helpers
 */
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const dbPath = path.join(__dirname, "lawfirm.db");
const db = new sqlite3.Database(dbPath);

// Création des tables si non existantes
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'utilisateur',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    reference TEXT,
    client_id INTEGER NOT NULL,
    status TEXT DEFAULT 'Ouvert',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS hearings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    location TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    originalname TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'Non payé',
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
  )`);

  // Crée un utilisateur admin par défaut s'il n'existe pas
  db.get("SELECT * FROM users WHERE email = ?", ["admin@cabinet.local"], async (err, row) => {
    if (err) return console.error(err);
    if (!row) {
      const hash = await bcrypt.hash("admin123", 10);
      db.run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        ["Administrateur", "admin@cabinet.local", hash, "admin"]);
      console.log("👤 Utilisateur admin créé: admin@cabinet.local / admin123");
    }
  });
});

module.exports = {
  db,
  // USERS
  findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });
  },
  // CLIENTS
  getClients() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM clients ORDER BY created_at DESC", [], (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  },
  getClient(id) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM clients WHERE id = ?", [id], (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });
  },
  createClient(data) {
    const { fullname, phone, email, address, notes } = data;
    return new Promise((resolve, reject) => {
      db.run("INSERT INTO clients (fullname, phone, email, address, notes) VALUES (?, ?, ?, ?, ?)",
        [fullname, phone, email, address, notes],
        function (err) { if (err) reject(err); else resolve(this.lastID); });
    });
  },
  updateClient(id, data) {
    const { fullname, phone, email, address, notes } = data;
    return new Promise((resolve, reject) => {
      db.run("UPDATE clients SET fullname=?, phone=?, email=?, address=?, notes=? WHERE id=?",
        [fullname, phone, email, address, notes, id],
        function (err) { if (err) reject(err); else resolve(this.changes); });
    });
  },
  deleteClient(id) {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM clients WHERE id = ?", [id], function (err) {
        if (err) reject(err); else resolve(this.changes);
      });
    });
  },
  // CASES
  getCases() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT cases.*, clients.fullname AS client_name
        FROM cases
        JOIN clients ON clients.id = cases.client_id
        ORDER BY cases.created_at DESC
      `, [], (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  },
  getCase(id) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT cases.*, clients.fullname AS client_name
        FROM cases
        JOIN clients ON clients.id = cases.client_id
        WHERE cases.id = ?
      `, [id], (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });
  },
  createCase(data) {
    const { title, reference, client_id, status, description } = data;
    return new Promise((resolve, reject) => {
      db.run("INSERT INTO cases (title, reference, client_id, status, description) VALUES (?, ?, ?, ?, ?)",
        [title, reference, client_id, status, description],
        function (err) { if (err) reject(err); else resolve(this.lastID); });
    });
  },
  updateCase(id, data) {
    const { title, reference, client_id, status, description } = data;
    return new Promise((resolve, reject) => {
      db.run("UPDATE cases SET title=?, reference=?, client_id=?, status=?, description=? WHERE id=?",
        [title, reference, client_id, status, description, id],
        function (err) { if (err) reject(err); else resolve(this.changes); });
    });
  },
  deleteCase(id) {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM cases WHERE id = ?", [id], function (err) {
        if (err) reject(err); else resolve(this.changes);
      });
    });
  },
  getCasesForClient(clientId) {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM cases WHERE client_id = ? ORDER BY created_at DESC", [clientId], (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  }
,
  // HEARINGS
  getHearings() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT hearings.*, cases.title AS case_title
        FROM hearings JOIN cases ON cases.id = hearings.case_id
        ORDER BY date ASC
      `, [], (err, rows) => { if (err) reject(err); else resolve(rows); });
    });
  },
  getHearingsForCase(caseId) {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM hearings WHERE case_id=? ORDER BY date ASC", [caseId], (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  },
  createHearing(data) {
    const { case_id, date, location, notes } = data;
    return new Promise((resolve, reject) => {
      db.run("INSERT INTO hearings (case_id, date, location, notes) VALUES (?, ?, ?, ?)",
        [case_id, date, location, notes], function(err){ if (err) reject(err); else resolve(this.lastID); });
    });
  },
  deleteHearing(id) {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM hearings WHERE id=?", [id], function(err){ if (err) reject(err); else resolve(this.changes); });
    });
  },
  // INVOICES
  getInvoices() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT invoices.*, cases.title AS case_title
        FROM invoices JOIN cases ON cases.id = invoices.case_id
        ORDER BY issued_at DESC
      `, [], (err, rows) => { if (err) reject(err); else resolve(rows); });
    });
  },
  getInvoice(id) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT invoices.*, cases.title AS case_title
        FROM invoices JOIN cases ON cases.id = invoices.case_id
        WHERE invoices.id = ?
      `, [id], (err, row) => { if (err) reject(err); else resolve(row); });
    });
  },
  createInvoice(data) {
    const { case_id, amount, status, notes } = data;
    return new Promise((resolve, reject) => {
      db.run("INSERT INTO invoices (case_id, amount, status, notes) VALUES (?, ?, ?, ?)",
        [case_id, amount, status || 'Non payé', notes], function(err){ if (err) reject(err); else resolve(this.lastID); });
    });
  },
  updateInvoice(id, data) {
    const { amount, status, notes } = data;
    return new Promise((resolve, reject) => {
      db.run("UPDATE invoices SET amount=?, status=?, notes=? WHERE id=?",
        [amount, status, notes, id], function(err){ if (err) reject(err); else resolve(this.changes); });
    });
  },
  deleteInvoice(id) {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM invoices WHERE id=?", [id], function(err){ if (err) reject(err); else resolve(this.changes); });
    });
  },
  // USERS
  createUser({ name, email, password_hash, role }) {
    return new Promise((resolve, reject) => {
      db.run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        [name, email, password_hash, role || 'utilisateur'], function(err){ if (err) reject(err); else resolve(this.lastID); });
    });
  },
  getUsers() {
    return new Promise((resolve, reject) => {
      db.all("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC", [], (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  },
  updatePassword(id, password_hash) {
    return new Promise((resolve, reject) => {
      db.run("UPDATE users SET password_hash=? WHERE id=?", [password_hash, id], function(err){ if (err) reject(err); else resolve(this.changes); });
    });
  }

};
