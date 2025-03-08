/**
 * Database Reset Script
 * 
 * This script completely drops and recreates the database and all tables.
 * Run with: npm run db:reset
 */

const { getMaintenanceConnection } = require('../db-config');
const { initializeDatabase } = require('./db-init');
const { execSync } = require('child_process');
const path = require('path');

async function resetDatabase() {
  console.log('🔄 Starting complete database reset...');
  
  // Get a maintenance connection (no database selected)
  const connection = getMaintenanceConnection();
  
  try {
    console.log('🗑️  Dropping database if it exists...');
    await connection.query('DROP DATABASE IF EXISTS mjpm');
    console.log('✅ Database dropped');
    
    console.log('🏗️  Creating fresh database...');
    await connection.query('CREATE DATABASE mjpm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Fresh database created');
    
    // Close the maintenance connection
    connection.end();
    
    console.log('🔄 Running initialization script...');
    // Use the exported function from the init script
    await initializeDatabase();
    
    console.log('🌱 Running seeding script...');
    // Execute the seed script as a separate process
    execSync('node ' + path.join(__dirname, 'db-seed.js'), { 
      stdio: 'inherit'
    });
    
    console.log('✅ Database reset completed successfully!');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    if (connection) {
      connection.end();
    }
    throw error;
  }
}

// When run directly as a script
if (require.main === module) {
  resetDatabase()
    .then(() => console.log('🎉 Database has been completely reset with the latest schema and sample data!'))
    .catch(err => {
      console.error('Reset process encountered an error:', err);
      process.exit(1);
    });
}

module.exports = { resetDatabase };
