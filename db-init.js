/**
 * Database initialization wrapper
 * This file redirects to the main initialization script in the scripts folder
 * Maintained for backwards compatibility with existing imports
 */

// Import the actual initialization functionality from scripts folder
const { initializeDatabase: scriptInitializeDatabase } = require('./scripts/db-init');

// Export the function with the same name to maintain compatibility
const initializeDatabase = async () => {
  console.log('Using centralized database initialization from scripts folder...');
  
  try {
    // Create a reference to the required module function to maintain interface compatibility
    await scriptInitializeDatabase();
    console.log('Database initialization completed via scripts/db-init.js');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

module.exports = { initializeDatabase };
