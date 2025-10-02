@echo off
echo =======================================
echo Restaurant Management System - Microservices
echo =======================================
echo.
echo 🧹 Cleaning up existing containers and volumes...
docker compose down -v
echo.
echo 🏗️  Building and starting all services...
docker compose up --build
echo.
echo 📊 Services Information:
echo Frontend:     http://localhost:3000
echo Customer API: http://localhost:5000
echo Staff API:    http://localhost:5001
echo Nginx Proxy:  http://localhost:8080
echo PostgreSQL:   localhost:5432
echo.
echo 🔧 API Documentation:
echo Customer API: http://localhost:5000/api-docs
echo Staff API:    http://localhost:5001/api-docs
echo =======================================