# Restaurant Management System

## Quick Start with Docker Compose

### Prerequisites
- Docker and Docker Compose installed
- Ports 3000, 5000, 5001, 5432, and 8080 available

### Setup & Run
```bash
# Clone and navigate to project directory
cd capstone

# Build and start all services
docker compose up --build

# For clean restart (removes existing data)
docker compose down -v
docker compose up --build
```

### Access Points
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Customer API**: http://localhost:5000
- **Staff API**: http://localhost:5001
- **API Documentation**: http://localhost:5000/api-docs

### Test Accounts
- **Customer**: `customer1` / `password123`
- **Staff**: `server1` / `password123`
- **Manager**: `manager1` / `password123`

### Troubleshooting
- **Port conflicts**: Stop conflicting services or change ports in `docker-compose.yml`
- **Build errors**: Run `docker system prune -a` then rebuild
- **Database issues**: Use `docker compose down -v` to reset all data
- **Service health**: Check with `docker compose ps` and `docker compose logs [service-name]`

## System Architecture

- **Microservices Design**: Separate customer-api and staff-api services with shared PostgreSQL database  
- **Frontend**: React TypeScript SPA with HeroUI components and Tailwind CSS  
- **API Gateway**: Nginx reverse proxy routing requests to appropriate microservices  
- **Authentication**: JWT-based with role-based access control (customer, staff, manager, admin)

## Feature Completion Status

| 😃 Completed | ☹️ Not Implemented |
|---|---|
| User authentication & authorization | Staff utilization reports |
| Role-based access control | Password reset functionality |
| Menu CRUD with image upload | Real-time notifications |
| Customer ordering system | Export functionality |
| Analytics & reporting dashboard | Email verification |
| Visual scheduling calendar | Multi-language support |
| Popular items analytics | Advanced conflict detection |
| Basic staff scheduling | Export functionality |
| Profile management | |
| Rate limiting (Nginx-based) | |
| Docker containerization | |
| RESTful API design | |