/**
 * Database Seeding System
 * Seeds the database with comprehensive test data for development and testing
 */

import { AppDataSource } from '../data-source';
import { seedUsers } from './userSeeds';
import { seedMenuItems } from './menuSeeds';
import { seedShiftTemplates } from './shiftSeeds';
import { seedShifts } from './shiftSeeds';
import { seedShiftRequirements } from './shiftSeeds';
import { seedShiftApplications } from './shiftSeeds';
import { seedShiftAssignments } from './shiftSeeds';
import { seedTimeOffRequests } from './shiftSeeds';
import { seedOrders } from './orderSeeds';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Clear existing data (always re-seed as requested)
    await clearExistingData();
    
    // Seed in dependency order
    console.log('📝 Seeding users...');
    await seedUsers();
    
    console.log('🍽️ Seeding menu items...');
    await seedMenuItems();
    
    console.log('⏰ Seeding shift templates...');
    await seedShiftTemplates();
    
    console.log('📅 Seeding shifts...');
    await seedShifts();
    
    console.log('👥 Seeding shift requirements...');
    await seedShiftRequirements();
    
    console.log('✋ Seeding shift applications...');
    await seedShiftApplications();
    
    console.log('🎯 Seeding shift assignments...');
    await seedShiftAssignments();
    
    console.log('🏖️ Seeding time off requests...');
    await seedTimeOffRequests();
    
    console.log('🛒 Seeding orders...');
    await seedOrders();
    
    console.log('✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  }
}

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');
  
  const entities = [
    'order_item',
    '"order"',  // Quote reserved keyword
    'time_off_request',
    'shift_assignment',
    'shift_application',
    'shift_requirement',
    'shift',
    'shift_template',
    'menu_item',
    '"user"'    // Quote reserved keyword
  ];
  
  for (const entity of entities) {
    await AppDataSource.query(`DELETE FROM ${entity}`);
    // Reset sequences if they exist
    try {
      const sequenceName = entity.replace(/"/g, '') + '_id_seq'; // Remove quotes for sequence name
      await AppDataSource.query(`ALTER SEQUENCE ${sequenceName} RESTART WITH 1`);
    } catch (error) {
      // Sequence might not exist, ignore
    }
  }
  
  console.log('🗑️ Existing data cleared');
}