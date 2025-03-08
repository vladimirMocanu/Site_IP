const { query } = require('./db-config');

const hotelsDB = {
  // Creează tabela hotelurilor
  createTable: async () => {
    try {
      await query(`CREATE TABLE IF NOT EXISTS hotel(
        id INT(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        owner INT(6) UNSIGNED,
        name VARCHAR(60),
        location VARCHAR(60),
        description VARCHAR(300)
      )`);
      console.log("Table hotel created or already exists");
    } catch (err) {
      console.error("Error creating hotel table:", err);
      throw err;
    }
  },
  // Șterge tabela hotelurilor
  deleteTable: async () => {
    try {
      await query("DROP TABLE IF EXISTS hotel");
    } catch (err) {
      console.error("Error dropping hotel table:", err);
      throw err;
    }
  },
  // Returnează toate hotelurile
  all: async () => {
    try {
      return await query('SELECT * FROM hotel');
    } catch (err) {
      console.error("Error getting all hotels:", err);
      throw err;
    }
  },
  // Inserarea unui hotel și returnarea ID-ului inserat
  insertHotel: async (owner, name, location, description) => {
    try {
      const result = await query(
        "INSERT INTO hotel (owner, name, location, description) VALUES (?, ?, ?, ?)",
        [owner, name, location, description]
      );
      return result.insertId;
    } catch (err) {
      console.error("Error inserting hotel:", err);
      throw err;
    }
  }
};

module.exports = hotelsDB;