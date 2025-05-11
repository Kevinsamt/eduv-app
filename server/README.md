# EduV App Server

This is the backend server for the EduV application, which handles user authentication and database operations.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Install dependencies:
   ```
   cd server
   npm install
   ```
   or with yarn:
   ```
   cd server
   yarn install
   ```

2. Start the server:
   ```
   npm start
   ```
   or with yarn:
   ```
   yarn start
   ```

   For development with auto-restart:
   ```
   npm run dev
   ```
   or with yarn:
   ```
   yarn dev
   ```

## Database

The server uses SQLite for the database, which is stored locally in a file called `database.sqlite`. The database will be created automatically when the server starts.

## API Endpoints

### Authentication

- **POST** `/api/auth/register` - Register a new user
  - Request body: `{ name, origin, nim, university, email, password, isTalentIncubator }`
  - Response: `{ token, message }`

- **POST** `/api/auth/login` - Login a user
  - Request body: `{ email, password }`
  - Response: `{ token, name, nim, university, origin, isTalentIncubator }` 