require('dotenv').config();
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import authRouter from './routes/auth';
import orderRouter from './routes/order';
import menuRouter from './routes/menu';
import { setupSwagger } from './config/swagger';
import path from 'path';

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

    // Seed database if SEED_DATABASE environment variable is set
    if (process.env.SEED_DATABASE === 'true') {
      console.log('🌱 Seeding database...');
      try {
        const { seedDatabase } = await import('./seeds/seedData');
        await seedDatabase();
        console.log('✅ Database seeding completed!');
      } catch (error) {
        console.error('❌ Database seeding failed:', error);
        // Don't exit on seeding failure in production
      }
    }
    
    // Setup Swagger documentation
    setupSwagger(app);
    
    // Serve uploaded files
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    
    // Only set up routes after database is connected
    app.use("/auth", authRouter);
    app.use("/api", orderRouter);
    app.use("/api/menu", menuRouter);
    
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK',
        message: 'API is running',
        timestamp: new Date().toISOString(),
        database: 'Connected'
      });
    });
    

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