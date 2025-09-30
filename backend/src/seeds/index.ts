#!/usr/bin/env node
import 'reflect-metadata';
import { seedDatabase } from './seedData';
import { AppDataSource } from '../data-source';

const runSeed = async () => {
  try {
    console.log('🌱 Starting database seed process...');
    
    // Seed the database
    await seedDatabase();
    
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

// Run the seed if this file is executed directly
if (require.main === module) {
  runSeed();
}