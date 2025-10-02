/**
 * Legacy seedData.ts - Now redirects to comprehensive seeding system
 * This file is kept for backward compatibility with existing imports
 */

import { seedDatabase as comprehensiveSeedDatabase } from './index';

export const seedDatabase = async (): Promise<boolean> => {
  console.log(' Using comprehensive seeding system...');
  
  try {
    // Use the new comprehensive seeding system that includes:
    // - Users, Menu Items, Shift Templates (basic data)
    // - Shifts, Shift Requirements, Shift Applications, Shift Assignments
    // - Orders and Order Items
    // - Time Off Requests
    await comprehensiveSeedDatabase();
    return true;
  } catch (error) {
    console.error('Comprehensive seeding failed:', error);
    return false;
  }
};
