const { query } = require('./db-config');

let messagesDB = {};

// Crează tabela mesajelor (a se rula în inițializare)
messagesDB.createTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS message (
      id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      sender_id INT(6) UNSIGNED,
      receiver_id INT(6) UNSIGNED,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES user(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES user(id) ON DELETE CASCADE
    )
  `);
  console.log("✅ Message table created or already exists");
};

// Trimite un mesaj de la un utilizator către altul
messagesDB.sendMessage = async (senderId, receiverId, content) => {
  return await query(
    "INSERT INTO message (sender_id, receiver_id, content) VALUES (?, ?, ?)",
    [senderId, receiverId, content]
  );
};

// Preia toate mesajele în care utilizatorul este implicat
messagesDB.getMessagesForUser = async (userId) => {
  let result = await query(
    `SELECT m.*, s.email AS senderEmail, r.email AS receiverEmail 
     FROM message m 
     JOIN user s ON m.sender_id = s.id 
     JOIN user r ON m.receiver_id = r.id
     WHERE m.sender_id = ? OR m.receiver_id = ?
     ORDER BY m.created_at ASC`,
    [userId, userId]
  );
  return result;
};

module.exports = messagesDB;

// Eroare intenționată pentru test PR:
console.log("Intentional error in messages-database.js")
