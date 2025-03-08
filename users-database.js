const { pool, query } = require('./db-config')

let usersDB = {}

usersDB.createTable = async () => {
  try {
    await query("CREATE TABLE IF NOT EXISTS user(id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, email VARCHAR(60), password VARCHAR(60))");
    console.log("User table created or already exists");
    return true;
  } catch (err) {
    console.error("Error creating user table:", err);
    throw err;
  }
}

usersDB.deleteTable = async () => {
  try {
    await query("DROP TABLE IF EXISTS user");
    return true;
  } catch (err) {
    console.error("Error dropping user table:", err);
    throw err;
  }
}

usersDB.all = async () => {
  try {
    return await query('SELECT * FROM user');
  } catch (err) {
    console.error("Error getting all users:", err);
    throw err;
  }
}

usersDB.getUser = async (email) => {
  try {
    return await query('SELECT * FROM user WHERE email = ?', [email]);
  } catch (err) {
    console.error(`Error getting user with email ${email}:`, err);
    throw err;
  }
}

usersDB.insertUser = async (email, password) => {
  try {
    await query("INSERT INTO user (email, password) VALUES ?", [[[email, password]]]);
    return true;
  } catch (err) {
    console.error(`Error inserting user ${email}:`, err);
    return false;
  }
}

usersDB.getUserByEmail = async (email) => {
  try {
    const results = await usersDB.getUser(email);
    
    if (results.length == 0) return null;

    return ({id: results[0].id, email: results[0].email, password: results[0].password});
  } catch(e) {
    console.error(`Error in getUserByEmail for ${email}:`, e);
    throw e;
  }
}

module.exports = usersDB