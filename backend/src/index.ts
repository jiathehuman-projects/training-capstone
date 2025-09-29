require('dotenv').config();
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/database';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

// Routes will be added here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});