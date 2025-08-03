# Setlist Management Backend

A Node.js Express API for managing musical setlists with PostgreSQL database and JWT authentication.

## Features

- 🔐 JWT Authentication
- 👤 User management
- 🎵 Song CRUD operations
- 📋 Setlist management
- 🔄 Song reordering in setlists
- 🔍 Search functionality
- ✅ Input validation
- 🛡️ Security middleware
- 📊 Rate limiting

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Security**: helmet, cors, rate-limiting

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE setlist_db;
```

2. Copy environment file:

```bash
cp .env.example .env
```

3. Update `.env` with your database credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/setlist_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# OR create and run migrations (for production)
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Songs

- `GET /api/songs` - Get all user songs
- `GET /api/songs/:id` - Get single song
- `POST /api/songs` - Create song
- `PUT /api/songs/:id` - Update song
- `DELETE /api/songs/:id` - Delete song

### Setlists

- `GET /api/setlists` - Get all user setlists
- `GET /api/setlists/:id` - Get single setlist
- `POST /api/setlists` - Create setlist
- `PUT /api/setlists/:id` - Update setlist
- `DELETE /api/setlists/:id` - Delete setlist
- `POST /api/setlists/:id/songs` - Add song to setlist
- `DELETE /api/setlists/:id/songs/:songId` - Remove song from setlist
- `PUT /api/setlists/:id/reorder` - Reorder songs in setlist

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/setlist_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:5173"
```

## Database Schema

### Users

- id, email, password, name, timestamps

### Songs

- id, title, lyrics, userId, timestamps

### Setlists

- id, name, userId, timestamps

### SetlistSongs (Junction table)

- id, setlistId, songId, order

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)

## Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if any
}
```

## Authentication

Include JWT token in requests:

```
Authorization: Bearer <your_jwt_token>
```

## Testing the API

### Health Check

```bash
curl http://localhost:5000/health
```

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure proper database URL
4. Set up SSL/TLS
5. Configure reverse proxy (nginx)
6. Set up monitoring and logging
