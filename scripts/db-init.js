/**
 * Database Initialization Script
 * 
 * This script creates the database and all required tables if they don't exist.
 * Run with: npm run db:init
 */

const { getMaintenanceConnection } = require('../db-config');

async function initializeDatabase() {
  // Get a maintenance connection (no database selected)
  const connection = getMaintenanceConnection();
  
  try {
    console.log('🚀 Starting database initialization...');
    
    // Create database if it doesn't exist with proper charset
    await connection.query('CREATE DATABASE IF NOT EXISTS mjpm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database "mjpm" created or already exists with UTF-8 support');
    
    // Use the database
    await connection.query('USE mjpm');
    
    // Create user table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ User table created or already exists');
    
    // Create hotel table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hotel (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        owner INT(6) UNSIGNED,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner) REFERENCES user(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Hotel table created or already exists');
    
    // Create room table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS room (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        hotel INT(6) UNSIGNED,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel) REFERENCES hotel(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Room table created or already exists');
    
    // Create reservation table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reservation (
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
    console.log('✅ Reservation table created or already exists');

    // Create message table
    await connection.query(`
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
    console.log('✅ Message table created or already exists');

    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    connection.end();
  }
}

// When run directly as a script
if (require.main === module) {
  initializeDatabase()
    .then(() => console.log('You can now run "npm run db:seed" to populate the database with sample data.'))
    .catch(err => console.error('Script execution failed:', err));
}

// Export for use in other files
module.exports = { initializeDatabase };
