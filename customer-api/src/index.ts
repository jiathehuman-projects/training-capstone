require('dotenv').config();
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from '../shared/data-source';
import authRouter from './routes/auth';
import orderRouter from './routes/order';
import menuRouter from './routes/menu';
import { setupSwagger } from '../shared/config/swagger';
import path from 'path';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'customer-api',
    message: 'Customer API is running',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Database Connection
interface HealthCheckResponse {
    status: string;
    service: string;
    message: string;
    timestamp: string;
    database: string;
}

interface SeedDatabaseModule {
    seedDatabase: () => Promise<boolean>;
}

AppDataSource.initialize()
    .then(async (): Promise<void> => {
        console.log('Customer API - Database connected successfully');
        
        // Run migrations automatically (only customer-api should run migrations)
        if (process.env.SEED_DATABASE === 'true') {
            console.log('Running database migrations...');
            try {
                await AppDataSource.runMigrations();
                console.log('Migrations completed successfully!');
            } catch (error: unknown) {
                console.error('Migration failed:', error);
                process.exit(1);
            }

            // Seed database if SEED_DATABASE environment variable is set
            console.log('Seeding database...');
            try {
                const { seedDatabase }: SeedDatabaseModule = await import('../shared/seeds/seedData');
                await seedDatabase();
                console.log('Database seeding completed!');
            } catch (error: unknown) {
                console.error('Database seeding failed:', error);
                // Don't exit on seeding failure
            }
        }
        
        // Setup Swagger documentation
        try {
            setupSwagger(app);
        } catch (error: unknown) {
            console.log('Swagger setup skipped:', error instanceof Error ? error.message : 'Unknown error');
        }
        
        // Serve uploaded files
        app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
        
        // Customer-focused routes
        app.use("/auth", authRouter);           // Customer registration/login
        app.use("/api/menu", menuRouter);       // Menu browsing
        app.use("/orders", orderRouter);        // Customer order creation
        
        app.get('/test', (req: express.Request, res: express.Response<HealthCheckResponse>) => {
            res.json({ message: 'Customer API test route working', service: 'customer-api' } as HealthCheckResponse);
        });
        
        // Start server after DB connection
        const PORT: string | number = process.env.PORT || 5000;
        app.listen(PORT, (): void => {
            console.log(`Customer API Documentation available at http://localhost:${PORT}/api-docs`);
            console.log(`Customer API is running on port ${PORT}`);
        });
    })
    .catch((error: unknown) => {
        console.error('Customer API - Error connecting to the database:', error);
        process.exit(1);
    });