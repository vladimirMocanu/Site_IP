// Configurare conexiune MySQL cu modulele necesare
const mysql = require('mysql');
const util = require('util');

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
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci'
};

const maintenanceConfig = { ...dbConfig, database: null, multipleStatements: true };

// Crearea pool-ului de conexiuni
const pool = mysql.createPool(dbConfig);

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database Connection Error:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') console.error('⚠️ Check MySQL credentials');
    if (err.code === 'ECONNREFUSED') console.error('⚠️ Ensure MySQL server is running');
    if (err.code === 'ER_BAD_DB_ERROR') console.error('⚠️ Database "mjpm" does not exist');
    return;
  }
  console.log('✅ Connected to MySQL database');
  connection.release();
});

const query = util.promisify(pool.query).bind(pool);
// Funcție helper pentru a obține o conexiune de mentenanță
const getMaintenanceConnection = () => {
  const connection = mysql.createConnection(maintenanceConfig);
  connection.query = util.promisify(connection.query).bind(connection);
  return connection;
};

module.exports = { pool, query, getMaintenanceConnection, config: dbConfig };
