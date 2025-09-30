# Restaurant Management System - Development Context

## Project Overview
Restaurant management system developed with modern web technologies, focusing on user authentication, menu management, order processing, and staff scheduling capabilities.

## Technical Stack
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with TypeORM
- **Frontend**: React + Vite
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest with TypeScript

# Documentation
https://localhost:5000/api-docs

## Implementation Status

### Database Architecture
```typescript
// Key Entities
User {
  auth: { username, email, passwordHash }
  profile: { firstName, lastName, phone }
  staff: { roles[], staffStatus, weeklyAvailability }
}

MenuItem {
  basic: { name, category, price }
  details: { description, photoUrl, preparationTime }
  inventory: { qtyOnHand, reorderThreshold }
  promo: { percent, startDate, endDate }
}

Order {
  status: enum { DRAFT...COMPLETED }
  payment: { mode, status, amounts }
  tracking: { placedAt, closedAt }
}

ShiftTemplate & Shift {
  timing: { startTime, endTime }
  staffing: { requirements, applications }
}
```

### Authentication Flow
```typescript
// Registration Process
POST /auth/register
{
  username, email, password,
  firstName, lastName, phone?
} => {
  token, user: { id, roles, ... }
}

// Login Process
POST /auth/login
{
  username, password
} => {
  token, user: { id, roles, ... }
}
```

### Development Environment
```yaml
# Docker Compose Structure
services:
  postgres:
    image: postgres:alpine
    volumes: [postgres_data]
    healthcheck: enabled

  backend:
    build: 
      context: ./backend
      target: development
    volumes: 
      - ./backend:/app
      - /app/node_modules

  frontend:
    build:
      context: ./frontend
      target: development
    volumes:
      - ./frontend:/app
      - /app/node_modules
```

## Project Structure
```
project/
├── backend/
│   ├── src/
│   │   ├── models/          # TypeORM entities
│   │   ├── controllers/     # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── migrations/     # DB migrations
│   │   ├── __tests__/     # Test suite
│   │   ├── data-source.ts  # DB config
│   │   └── index.ts       # Entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/    # React components
    │   ├── pages/        # Route pages
    │   └── main.tsx      # Entry point
    └── package.json
```

## Configuration Details

### Backend Environment
```env
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=restaurant_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

### Database Migrations
```bash
# Generate migration
npm run migration:generate

# Run migration
npm run migration:run

# Revert migration
npm run migration:revert
```

## Testing Framework
```typescript
// Test Setup
beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

beforeEach(async () => {
  // Clear all tables
  const entities = AppDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name);
    await repository.clear();
  }
});
```

## Development State

### Working Features
- [x] Database connections
- [x] Entity relationships
- [x] Basic authentication
- [x] Development environment
- [x] Test framework

### Pending Implementation
- [ ] API endpoints completion
- [ ] Frontend routes
- [ ] Staff scheduling
- [ ] Menu management
- [ ] Order processing

## Port Configuration
- Database: 5432
- Backend API: 5000
- Frontend Dev: 5173

## Quick Start
```bash
# Clean start
docker compose down -v

# Build and start
docker compose up --build

# Run tests
cd backend && npm test
```

---

implement a frontend menu page under frontend/src/pages as a new menu.tsx file. This should link to the backend menu functionality, where the full route is localhost:5000/api/menu

Last Updated: September 29, 2025
Project Status: Active Development
Version: 0.1.0

