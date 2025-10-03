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

### Container Architecture Overview

```
                    ┌─────────────────────────────┐
                    │       Frontend              │
                    │    React + Vite :3000       │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────┴───────────────┐
                    │     Nginx API Gateway       │
                    │      Load Balancer :8080    │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────┴───────────────┐
                    │                            │
          ┌─────────┴─────────┐        ┌─────────┴─────────┐
          │   Customer API    │        │    Staff API      │
          │ Node.js + Express │        │ Node.js + Express │
          │      :5000        │        │      :5001        │
          └─────────┬─────────┘        └─────────┬─────────┘
                    │                            │
          ┌─────────┴────────────────────────────┴─────────┐
          │            PostgreSQL Database                 │
          │          Data Persistence :5432                │
          └────────────────────────────────────────────────┘
```

### Container Descriptions

- **Frontend Container (restaurant_frontend)**  
Serves the React TypeScript single-page application with HeroUI components and Tailwind CSS styling. Handles all user interface rendering, client-side routing, and API communication for customers, staff, and managers.

- **Nginx Container (restaurant_nginx)**  
Acts as a reverse proxy and API gateway, routing incoming requests to appropriate microservices based on URL patterns. Provides load balancing, CORS handling, rate limiting, and centralized SSL termination for production deployments.

- **Customer API Container (restaurant_customer_api)**  
Manages all customer-facing operations including authentication, registration, menu browsing, order placement, and order tracking. Implements JWT-based authentication and handles customer-specific business logic with role-based access control.

- **Staff API Container (restaurant_staff_api)**  
Handles staff and management operations including shift scheduling, order fulfillment, analytics dashboards, and administrative functions. Provides manager-specific endpoints for staff management, shift creation, and comprehensive reporting features.

- **PostgreSQL Container (restaurant_postgres)**  
Serves as the centralized relational database storing all application data with proper foreign key relationships and indexing. Maintains data consistency across microservices and handles complex queries for analytics, scheduling, and order management.

### Microservices Architecture Benefits

- **Nginx Gateway Necessity**: The API gateway provides essential request routing, CORS policy enforcement, and rate limiting protection while enabling seamless service discovery and load distribution. It acts as a single entry point that abstracts the underlying microservice complexity from frontend clients. Additionally, it facilitates horizontal scaling by distributing traffic across multiple service instances and provides centralized monitoring and logging capabilities.

- **Separation of Customer and Staff APIs**: Isolating customer and staff operations into separate services enables independent scaling based on different usage patterns and performance requirements. This architectural separation improves security by creating distinct authentication boundaries and reduces the blast radius of potential service failures. Furthermore, it allows development teams to work independently on different service domains while maintaining clean API contracts and deployment isolation.

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