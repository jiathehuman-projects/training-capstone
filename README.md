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
- **API Documentation**: [api-documentation.md](./api-documentation.md) (Complete endpoint reference)
- **Interactive API Docs**: http://localhost:5000/api-docs | http://localhost:5001/api-docs

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
| User authentication & authorization | Staff utilization reports (partially) |
| Role-based access control | Password reset functionality (partially) |
| Menu CRUD with image upload | Export functionality |
| Customer ordering system | Email verification |
| Analytics & reporting dashboard | Multi-language support |
| Visual scheduling calendar | Advanced conflict detection |
| Popular items analytics | |
| Basic staff scheduling | |
| Profile management | |
| Rate limiting (Nginx-based) | |
| Real-time notifications | |
| Docker containerization | |
| RESTful API design | |
| **Swagger/OpenAPI documentation** | |

## Database Schema

![Entity Relationship Diagram](erd.png)

The restaurant management system uses a PostgreSQL database with a comprehensive relational schema designed to handle all aspects of restaurant operations. The core entities include Users (customers, staff, managers, admins), MenuItems with categories and pricing, and Orders with associated OrderItems for detailed tracking. The scheduling system is built around Shifts, ShiftTemplates, ShiftRequirements, ShiftApplications, and ShiftAssignments to manage staff scheduling efficiently. TimeOffRequests handle employee vacation and personal time management. All entities use proper foreign key relationships, indexing on frequently queried fields, and TypeORM decorators for seamless object-relational mapping.