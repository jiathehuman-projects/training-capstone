require('dotenv').config();
import 'reflect-metadata';
import express from 'express';
// import cors from 'cors'; // Disabled - nginx handles CORS
import { AppDataSource } from '../shared/data-source';
import authRouter from './routes/auth';
import orderRouter from './routes/order';
import staffRouter from './routes/staff';
import analyticsRouter from './routes/analytics';
import { setupSwagger } from '../shared/config/swagger';
import path from 'path';

const app = express();

// Middleware
// app.use(cors()); // Disabled - nginx handles CORS
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'staff-api',
    message: 'Staff API is running',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Database Connection
AppDataSource.initialize()
  .then(async () => {
    console.log('Staff API - Database connected successfully');
    
    // Setup Swagger documentation
    try {
      setupSwagger(app);
    } catch (error) {
      console.log('Swagger setup skipped:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Serve uploaded files
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    
    // Staff-focused routes
    app.use("/auth", authRouter);           // Staff/Manager/Admin login
    app.use("/api/staff", staffRouter);     // Staff management
    app.use("/api/analytics", analyticsRouter); // Analytics for managers
    app.use("/orders", orderRouter);        // Staff can view/update orders
    
    app.get('/test', (req, res) => {
      res.json({ message: 'Staff API test route working', service: 'staff-api' });
    });
    
    // Start server after DB connection
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Staff API Documentation available at http://localhost:${PORT}/api-docs`);
      console.log(`Staff API is running on port ${PORT}`);
    });
  })
  .catch((error: any) => {
    console.error('Staff API - Error connecting to the database:', error);
    process.exit(1);
  });