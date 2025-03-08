# MJPM Booking Platform

<!-- Prezentare generală a proiectului -->
A hotel booking platform project for IP course.

## Setup Instructions

<!-- Cerințele pentru rulare -->
### Requirements
- Node.js (v12+)
- MySQL Server (v5.7+)
- npm

<!-- Configurare bază de date -->
### Database Setup
1. Make sure MySQL is running on port 3306.
2. Create a database user with:
   - username: `root`
   - password: `secret`
   
## Installation

<!-- Pași pentru instalare -->
1. Clone the repository.
2. Install dependencies:
   ```
   npm install
   ```
3. Initialize the database:
   ```
   npm run db:init
   ```
4. (Optional) Seed the database with sample data:
   ```
   npm run db:seed
   ```

## Running the Application

<!-- Instrucțiuni de rulare -->
- For development with auto-reload:
  ```
  npm run dev
  ```
- For production:
  ```
  npm start
  ```

<!-- Explicații suplimentare -->
The application will be available at: http://localhost:3000

## Features

<!-- Funcționalități principale ale proiectului -->
- User authentication (login/signup)
- Hotel listing and management
- Room booking system
- Responsive design for all devices

## Project Structure

<!-- Descrierea structurii proiectului -->
- `/scripts` - Database initialization and seeding scripts.
- `/public` - Static assets (CSS, JavaScript, images).
- `/views` - HTML templates.
- Root directory - Server configuration and database modules.

## Development Commands

<!-- Comenzi utile pentru dezvoltatori -->
- `npm run dev` - Start server with auto-reload.
- `npm start` - Start server normally.
- `npm run db:init` - Initialize database schema.
- `npm run db:seed` - Populate database with sample data.
- `npm run db:reset` - Reset and reseed database (combines init and seed).

## Authors

<!-- Lista autorilor -->
- Mocanu
- Jercan
- Posta
- Marcu

