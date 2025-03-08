const mysql = require('mysql')
const util = require('util')

/**
 * Centralized database configuration and connection management
 * Provides connection handling for both app and maintenance scripts
 */

// Standard database configuration with database selected
const dbConfig = {
  connectionLimit: 10,
  host: "127.0.0.1", 
  user: "root",
  password: "secret", 
  database: "mjpm",
  port: "3306",
  connectTimeout: 10000,
  insecureAuth: true,
  multipleStatements: false,
  charset: 'utf8mb4', // Use UTF-8 to support all characters including emoji
  collation: 'utf8mb4_unicode_ci' // For proper sorting of non-ASCII characters
}

// Configuration for maintenance operations (without database)
const maintenanceConfig = {
  ...dbConfig,
  database: null,
  multipleStatements: true
}

// Create connection pool for application use
const pool = mysql.createPool(dbConfig)

// Test the connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database Connection Error:', err.message)
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('⚠️ Check your MySQL username and password')
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('⚠️ Check if MySQL server is running')
    }
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('⚠️ Database "mjpm" does not exist')
    }
    return
  }
  
  console.log('✅ Connected to MySQL database')
  connection.release()
})

// Create a maintenance connection (for DB creation, etc.)
function getMaintenanceConnection() {
  const connection = mysql.createConnection(maintenanceConfig)
  // Promisify for easier async/await usage
  connection.query = util.promisify(connection.query).bind(connection)
  return connection
}

// Promisify the pool query method for easier usage
const query = util.promisify(pool.query).bind(pool)

module.exports = {
  pool,                      // Standard connection pool for app use
  query,                     // Promisified query method
  getMaintenanceConnection,  // For DB setup/maintenance
  config: dbConfig           // Access to config if needed
}
