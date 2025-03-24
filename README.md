# MJPM Booking Platform

A hotel booking platform project for IP course.

## Setup Instructions

### Requirements
- Node.js (v12+)
- MySQL Server (v5.7+)
- npm
- Docker (optional)
- Go (optional)

### Database Setup
1. Make sure MySQL is running on port 3306
2. Create a database user with:
   - username: `root`
   - password: `secret`
3. Alternatively, use Docker to run MySQL:
   ```
   docker-compose up -d db
   ```

### Installation
1. Clone the repository
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

### Running the Application
- For development with auto-reload:
  ```
  npm run dev
  ```
- For production:
  ```
  npm start
  ```

The application will be available at: http://localhost:3000

### Sample Login Credentials (after db:seed)
- Admin: admin@example.com / admin123
- User: user@example.com / user123
- Hotel Owner: hotel@example.com / hotel123

## Features
- User authentication (login/signup)
- Hotel listing and management
- Room booking system
- Responsive design for all devices

## Project Structure
- `/scripts` - Database initialization and seeding scripts
- `/public` - Static assets (CSS, JavaScript, images)
- `/views` - HTML templates
- `/docker` - Docker configuration files
- `/go` - Go scripts
- Root directory - Server configuration and database modules

## Development Commands
- `npm run dev` - Start server with auto-reload
- `npm start` - Start server normally
- `npm run db:init` - Initialize database schema
- `npm run db:seed` - Populate database with sample data
- `npm run db:reset` - Reset and reseed database (combines init and seed)
- `docker-compose up -d db` - Start MySQL database using Docker

## Authors
- Mocanu
