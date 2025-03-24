const { query } = require('./db-config');

const roomsDB = {
  // Creează tabela camerelor
  createTable: async () => {
    try {
      await query(`CREATE TABLE IF NOT EXISTS room(
        id INT(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        hotelId INT(6),
        name VARCHAR(60),
        price DECIMAL(10,2),
        description VARCHAR(300)
      )`);
      console.log("Room table created or already exists");
    } catch (err) {
      console.error("Error creating room table:", err);
      throw err;
    }
  },
  // Șterge tabela camerelor
  deleteTable: async () => {
    try {
      await query("DROP TABLE IF EXISTS room");
    } catch (err) {
      console.error("Error dropping room table:", err);
      throw err;
    }
  },
  // Returnează camerele unui hotel specific
  all: async (hotelId) => {
    try {
      return await query('SELECT * FROM room WHERE hotelId = ?', [hotelId]);
    } catch (err) {
      console.error("Error getting rooms:", err);
      throw err;
    }
  },
  // Inserarea unei camere și returnarea ID-ului
  insertRoom: async (hotelId, name, price, description) => {
    try {
      const result = await query(
        "INSERT INTO room (hotelId, name, price, description) VALUES (?, ?, ?, ?)",
        [hotelId, name, price, description]
      );
      return result.insertId;
    } catch (err) {
      console.error("Error inserting room:", err);
      throw err;
    }
  }
};

module.exports = roomsDB;