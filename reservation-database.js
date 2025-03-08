const { pool, query } = require('./db-config')

let reservationsDB = {}

reservationsDB.createTable = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS reservation(
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
        userid INT(6) UNSIGNED, 
        roomid INT(6) UNSIGNED,
        check_in DATE,
        check_out DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userid) REFERENCES user(id) ON DELETE SET NULL,
        FOREIGN KEY (roomid) REFERENCES room(id) ON DELETE CASCADE
      )
    `);
    console.log("Reservation table created or already exists");
    return true;
  } catch (err) {
    console.error("Error creating reservation table:", err);
    throw err;
  }
}

reservationsDB.deleteTable = async () => {
  try {
    await query("DROP TABLE IF EXISTS reservation");
    return true;
  } catch (err) {
    console.error("Error dropping reservation table:", err);
    throw err;
  }
}

reservationsDB.insertReservation = async (userid, roomid, check_in = null, check_out = null) => {
  try {
    if (check_in && check_out) {
      await query(
        "INSERT INTO reservation (userid, roomid, check_in, check_out) VALUES ?", 
        [[[userid, roomid, check_in, check_out]]]
      );
    } else {
      await query(
        "INSERT INTO reservation (userid, roomid) VALUES ?", 
        [[[userid, roomid]]]
      );
    }
    return true;
  } catch (err) {
    console.error(`Error creating reservation for user ${userid} and room ${roomid}:`, err);
    return false;
  }
}

reservationsDB.getByUser = async (userId) => {
  try {
    // Join reservation with room and hotel for richer data
    return await query(
      `SELECT r.*, rm.name AS roomName, rm.price, rm.description,
              h.name AS hotelName, h.location
       FROM reservation r
       JOIN room rm ON r.roomid = rm.id
       JOIN hotel h ON rm.hotel = h.id
       WHERE r.userid = ?`,
      [userId]
    );
  } catch (err) {
    console.error("Error in getByUser:", err);
    throw err;
  }
}

// Preia rezervările pentru hotelurile deținute de un anumit owner
reservationsDB.getByOwner = async (ownerId) => {
  return await query(
    `SELECT r.*, rm.name AS roomName, rm.price, rm.description,
            h.name AS hotelName, h.location
     FROM reservation r
     JOIN room rm ON r.roomid = rm.id
     JOIN hotel h ON rm.hotel = h.id
     WHERE h.owner = ?
     ORDER BY r.created_at ASC`,
    [ownerId]
  );
};

reservationsDB.deleteReservation = async (reservationId) => {
  try {
    await query('DELETE FROM reservation WHERE id = ?', [reservationId]);
    return true;
  } catch (err) {
    console.error("Error deleting reservation:", err);
    throw err;
  }
};

module.exports = reservationsDB