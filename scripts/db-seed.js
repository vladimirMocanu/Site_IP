/**
 * Database Seeding Script
 * 
 * This script populates the database with sample data.
 * Run with: npm run db:seed
 */

const bcrypt = require('bcrypt');
const { query } = require('../db-config');

// Sample data
const users = [
  { email: 'admin@example.com', password: 'admin123' },
  { email: 'user@example.com', password: 'user123' },
  { email: 'hotel@example.com', password: 'hotel123' }
];

const hotels = [
  { 
    ownerEmail: 'hotel@example.com', 
    name: 'Grand Hotel', 
    location: 'Bucharest, Romania', 
    description: 'A luxury hotel in the heart of Bucharest with excellent amenities and service.'
  },
  { 
    ownerEmail: 'hotel@example.com', 
    name: 'Seaside Resort', 
    location: 'Constanta, Romania', // Removed special character ț
    description: 'Beautiful beachfront resort with stunning views of the Black Sea.'
  },
  { 
    ownerEmail: 'admin@example.com', 
    name: 'Mountain Lodge', 
    location: 'Brasov, Romania', // Removed special character ș
    description: 'Cozy mountain retreat surrounded by nature with amazing hiking trails nearby.'
  }
];

const rooms = [
  { hotel: 'Grand Hotel', name: 'Standard Room', price: 100, description: 'Comfortable room with a queen-size bed and city view.' },
  { hotel: 'Grand Hotel', name: 'Deluxe Room', price: 150, description: 'Spacious room with a king-size bed and premium amenities.' },
  { hotel: 'Grand Hotel', name: 'Suite', price: 250, description: 'Luxury suite with separate living area and panoramic city views.' },
  
  { hotel: 'Seaside Resort', name: 'Beach View Room', price: 120, description: 'Room with a balcony overlooking the beautiful beach.' },
  { hotel: 'Seaside Resort', name: 'Family Room', price: 180, description: 'Spacious room with two queen-size beds, perfect for families.' },
  
  { hotel: 'Mountain Lodge', name: 'Mountain View Room', price: 110, description: 'Cozy room with breathtaking views of the mountains.' },
  { hotel: 'Mountain Lodge', name: 'Cabin', price: 200, description: 'Private cabin with a fireplace and mountain views.' }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data using DELETE instead of TRUNCATE for tables with foreign key constraints
    await query('SET FOREIGN_KEY_CHECKS = 0');
    await query('TRUNCATE TABLE reservation');
    await query('TRUNCATE TABLE room');
    await query('DELETE FROM hotel'); // Changed from TRUNCATE TABLE hotel
    await query('DELETE FROM user');  // Changed from TRUNCATE TABLE user
    await query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Existing data cleared');

    // Insert users
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await query('INSERT INTO user (email, password) VALUES (?, ?)', [user.email, hashedPassword]);
    }
    console.log('✅ Users created');

    // Insert hotels
    for (const hotel of hotels) {
      // Get the owner's ID
      const [owner] = await query('SELECT id FROM user WHERE email = ?', [hotel.ownerEmail]);
      await query(
        'INSERT INTO hotel (owner, name, location, description) VALUES (?, ?, ?, ?)',
        [owner.id, hotel.name, hotel.location, hotel.description]
      );
    }
    console.log('✅ Hotels created');

    // Insert rooms
    for (const room of rooms) {
      // Get the hotel ID
      const [hotel] = await query('SELECT id FROM hotel WHERE name = ?', [room.hotel]);
      await query(
        'INSERT INTO room (hotel, name, price, description) VALUES (?, ?, ?, ?)',
        [hotel.id, room.name, room.price, room.description]
      );
    }
    console.log('✅ Rooms created');

    // Create some reservations
    const [user1] = await query('SELECT id FROM user WHERE email = ?', ['user@example.com']);
    const [room1] = await query('SELECT id FROM room LIMIT 1');
    const [room2] = await query('SELECT id FROM room LIMIT 1, 1');
    
    // Future reservation
    const futureCheckIn = new Date();
    futureCheckIn.setDate(futureCheckIn.getDate() + 7); // 7 days from now
    const futureCheckOut = new Date(futureCheckIn);
    futureCheckOut.setDate(futureCheckOut.getDate() + 3); // 3-day stay

    await query(
      'INSERT INTO reservation (userid, roomid, check_in, check_out) VALUES (?, ?, ?, ?)',
      [user1.id, room1.id, futureCheckIn, futureCheckOut]
    );

    // Past reservation
    const pastCheckIn = new Date();
    pastCheckIn.setMonth(pastCheckIn.getMonth() - 1); // 1 month ago
    const pastCheckOut = new Date(pastCheckIn);
    pastCheckOut.setDate(pastCheckOut.getDate() + 4); // 4-day stay

    await query(
      'INSERT INTO reservation (userid, roomid, check_in, check_out) VALUES (?, ?, ?, ?)',
      [user1.id, room2.id, pastCheckIn, pastCheckOut]
    );

    console.log('✅ Reservations created');
    console.log('🎉 Database seeding completed successfully!');
    console.log('\nSample login credentials:');
    console.log('-------------------------');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: user@example.com / user123');
    console.log('Hotel Owner: hotel@example.com / hotel123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run the seeding
seedDatabase();
