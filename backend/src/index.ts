require('dotenv').config();
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import authRouter from './routes/auth';
import orderRouter from './routes/order';
import { setupSwagger } from './config/swagger';
import { seedDatabase } from './seeds';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
AppDataSource.initialize()
  .then(async () => {
    console.log('Database connected successfully');
    
    // Run migrations automatically
    console.log('🔄 Running database migrations...');
    try {
      await AppDataSource.runMigrations();
      console.log('✅ Migrations completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
    
    // Seed database with example data
    console.log('🌱 Seeding database with example data...');
    try {
      await seedDatabase();
      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      process.exit(1);
    }
    
    // Setup Swagger documentation
    setupSwagger(app);
    
    // Only set up routes after database is connected
    app.use("/auth", authRouter);
    app.use("/orders", orderRouter);
    
    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Health check endpoint
     *     description: Check if the API is running and database is connected
     *     tags: [System]
     *     responses:
     *       200:
     *         description: API is healthy
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: OK
     *                 message:
     *                   type: string
     *                   example: API is running
     *                 timestamp:
     *                   type: string
     *                   format: date-time
     *                   example: 2025-01-15T14:30:00Z
     *                 database:
     *                   type: string
     *                   example: Connected
     */
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK',
        message: 'API is running',
        timestamp: new Date().toISOString(),
        database: 'Connected'
      });
    });
    
    /**
     * @swagger
     * /test:
     *   get:
     *     summary: Test endpoint
     *     description: Simple test endpoint to verify API functionality
     *     tags: [System]
     *     responses:
     *       200:
     *         description: Test successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Test route working
     */
    app.get('/test', (req, res) => {
      res.json({ message: 'Test route working' });
    });
    
    // Start server after DB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`📚 API Documentation available at http://localhost:5000/api-docs`);
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  });