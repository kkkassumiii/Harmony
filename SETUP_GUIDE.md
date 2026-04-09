# Гармония с собой - Setup Guide

## Quick Start with Docker (Recommended)

### Prerequisites
- Docker Desktop installed and running
- Docker Compose

### One-Command Startup
```bash
# From project root
docker-compose up --build
```

This will:
- Build both backend and frontend images
- Start PostgreSQL database
- Run database migrations automatically
- Seed database with default emotions
- Start both servers in development mode

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger docs: http://localhost:8000/api/docs

### Docker Compose Commands
```bash
# Build images
docker-compose build --no-cache

# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f backend    # Backend logs
docker-compose logs -f frontend   # Frontend logs
docker-compose logs -f postgres   # Database logs

# Stop services
docker-compose down

# Remove volumes (WARNING: deletes database)
docker-compose down -v
```

---

## Manual Setup (Local Development)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 15+ installed and running locally
- npm or yarn package manager

## Backend Setup (No Docker)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Edit the `.env` file with your local PostgreSQL credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/harmony_db"
JWT_SECRET="your_secret_key_here_min_32_chars"
JWT_EXPIRES_IN="30d"
PORT=8000
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

### 3. Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE harmony_db;

# Exit psql
\q
```

### 4. Generate Prisma Client
```bash
npm run db:generate
```

### 5. Run Database Migrations
```bash
npm run db:migrate
```

### 6. Seed Database with Default Emotions (Optional)
```bash
npm run db:seed
```

### 7. Start Backend Development Server
```bash
npm run dev
```

The server will start on `http://localhost:8000`
Swagger documentation available at `http://localhost:8000/api/docs`

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the frontend directory:
```bash
cp .env.example .env
```

Edit the `.env` file:
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_APP_NAME="Гармония с собой"
```

### 3. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

## Complete Startup Guide

### Terminal 1 - Start Backend
```bash
cd backend
npm install          # if not done yet
npm run db:generate  # generate Prisma client
npm run db:migrate   # run database migrations
npm run db:seed      # populate with demo emotions (optional)
npm run dev          # start development server
```

Backend will be available at: http://localhost:8000
Swagger API docs at: http://localhost:8000/api/docs

### Terminal 2 - Start Frontend
```bash
cd frontend
npm install          # if not done yet
npm start            # start React development server
```

Frontend will be available at: http://localhost:3000

## Database Schema

The Prisma schema includes:
- **User**: User accounts with email/username authentication
- **Profile**: User profile information (name, bio, avatar)
- **Emotion**: Custom emotions defined by user
- **EmotionEntry**: Daily emotion diary entries
- **Goal**: Goals with progress tracking
- **Habit**: Habits with streak counting

All tables use UUID primary keys and have proper foreign key relationships with cascade deletes.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires JWT)

### Emotions
- `GET /api/emotions` - List user emotions
- `POST /api/emotions` - Create emotion
- `GET /api/emotions/:id` - Get emotion
- `PUT /api/emotions/:id` - Update emotion
- `DELETE /api/emotions/:id` - Delete emotion

### Emotion Entries
- `GET /api/emotion-entries` - List entries (supports skip/take pagination)
- `POST /api/emotion-entries` - Create entry
- `GET /api/emotion-entries/:id` - Get entry
- `PUT /api/emotion-entries/:id` - Update entry
- `DELETE /api/emotion-entries/:id` - Delete entry

### Goals
- `GET /api/goals` - List goals
- `POST /api/goals` - Create goal
- `GET /api/goals/:id` - Get goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Habits
- `GET /api/habits` - List habits
- `POST /api/habits` - Create habit
- `GET /api/habits/:id` - Get habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

## Development Workflow

1. Make changes to backend routes in `backend/src/routes/*.ts`
2. Server automatically reloads with ts-node
3. Frontend updates instantly with React hot reload
4. Check Swagger docs at http://localhost:8000/api/docs for API changes

## Database Migrations

Create a new migration after schema changes:
```bash
npm run db:migrate -- --name descriptive_name
```

View migration history:
```bash
ls prisma/migrations/
```

## Troubleshooting

### Docker Issues

**Container won't start**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Rebuild without cache
docker-compose build --no-cache
docker-compose up
```

**Database connection failure**
```bash
# Ensure PostgreSQL container is healthy
docker-compose ps
# Look for "healthy" status on postgres service

# Wait for database to be ready, then restart
docker-compose restart backend
```

**Port conflicts (3000, 8000, 5432 already in use)**
```bash
# Modify docker-compose.yml ports section:
ports:
  - "3001:3000"  # Change first number
  - "8001:8000"  # Change first number
  - "5433:5432"  # Change first number
```

**Volume/permissions issues**
```bash
# Clean up volumes
docker-compose down -v

# Rebuild everything
docker-compose build --no-cache
docker-compose up
```

**Node modules issues inside container**
```bash
# Rebuild frontend and backend without cache
docker-compose build --no-cache frontend backend

# Clear and reinstall
docker-compose exec backend npm install
docker-compose exec frontend npm install
```

### Local Development Issues

**Database Connection Error**
- Verify PostgreSQL is running: `psql -U postgres`
- Check DATABASE_URL in .env file
- Ensure harmony_db database exists

**Port Already in Use**
- Backend: Change PORT in .env file
- Frontend: PORT=3001 npm start

**JWT Token Issues**
- Ensure JWT_SECRET is set and consistent
- Token expires after JWT_EXPIRES_IN period
- Include in Authorization header: `Bearer <token>`

**Module Not Found Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Regenerate Prisma client: `npm run db:generate`

## Next Steps

1. ✅ Backend API fully functional
2. TODO: Build React frontend components
3. TODO: Implement Redux state management
4. TODO: Add form validation and error handling
5. TODO: Implement responsive styling with Bootstrap + SCSS
6. TODO: Add analytics dashboard
7. TODO: User load testing

## Support

For more documentation, see:
- [API Documentation](./docs/API.md)
- [Project Structure](./docs/PROJECT_STRUCTURE.md)
- [Git Workflow](./docs/GIT_WORKFLOW.md)
