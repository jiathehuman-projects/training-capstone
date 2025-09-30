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

## Quick Start
```bash
# Clean start
docker compose down -v

# Build and start
docker compose up --build

# Run tests
cd backend && npm test
```