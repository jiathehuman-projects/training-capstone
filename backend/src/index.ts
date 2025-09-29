require('dotenv').config();
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import authRouter from './routes/auth';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');
    
    // Only set up routes after database is connected
    app.use("/auth", authRouter);
    
    // Start server after DB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  });

app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Routes will be added here
app.use("/auth", authRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});