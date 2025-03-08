const { query } = require('./db-config');

const usersDB = {
  // Creează tabela utilizatorilor dacă nu există
  createTable: async () => {
    try {
      await query(`CREATE TABLE IF NOT EXISTS user(
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(60),
        password VARCHAR(60)
      )`);
      console.log("User table created or already exists");
    } catch (err) {
      console.error("Error creating user table:", err);
      throw err;
    }
  },
  // Șterge tabela utilizatorilor
  deleteTable: async () => {
    try {
      await query("DROP TABLE IF EXISTS user");
    } catch (err) {
      console.error("Error dropping user table:", err);
      throw err;
    }
  },
  // Returnează toți utilizatorii din baza de date
  all: async () => {
    try {
      return await query('SELECT * FROM user');
    } catch (err) {
      console.error("Error getting all users:", err);
      throw err;
    }
  },
  // Caută un utilizator după email
  getUser: async (email) => {
    try {
      const result = await query('SELECT * FROM user WHERE email = ?', [email]);
      return result[0] || null;
    } catch (err) {
      console.error("Error getting user:", err);
      throw err;
    }
  },
  // Inserarea unui nou utilizator
  insertUser: async (email, password) => {
    try {
      return await query('INSERT INTO user (email, password) VALUES (?, ?)', [email, password]);
    } catch (err) {
      console.error("Error inserting user:", err);
      throw err;
    }
  }
};

module.exports = usersDB;