import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { 
  User,
  MenuItem,
  Order,
  OrderItem,
  ShiftTemplate,
  Shift,
  ShiftRequirement,
  ShiftApplication,
  ShiftAssignment,
  TimeOffRequest
} from './models';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'restaurant_db',
  synchronize: process.env.NODE_ENV !== 'production', 
  logging: process.env.NODE_ENV !== 'production',
  dropSchema: process.env.DROP_SCHEMA === 'true', // Add option to drop schema
  entities: [
    User,
    MenuItem,
    Order,
    OrderItem,
    ShiftTemplate,
    Shift,
    ShiftRequirement,
    ShiftApplication,
    ShiftAssignment,
    TimeOffRequest
  ],
  subscribers: [],
  migrations: [],
  migrationsRun: false
});

// Function to initialize database connection
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
    
    // Log connection details in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      const config = AppDataSource.options as any; // Type assertion for logging
      console.log('Connected to database:', {
        host: config.host,
        port: config.port,
        database: config.database,
        synchronize: config.synchronize,
        dropSchema: config.dropSchema
      });
    }
  } catch (error) {
    console.error('Error during Data Source initialization:', error);
    throw error;
  }
};