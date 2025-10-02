/**
 * User Seeds
 * Creates comprehensive user data including admin, manager, staff, and customers
 */

import { AppDataSource } from '../data-source';
import { User } from '../models/User';
import { StaffStatus } from '../models/enums';
import bcrypt from 'bcrypt';

export async function seedUsers() {
  const userRepository = AppDataSource.getRepository(User);
  
  const users = [
    // Admin User
    {
      username: 'admin',
      email: 'admin@nightrestaurant.com',
      passwordHash: await bcrypt.hash('password123', 10),
      roles: ['admin', 'manager'],
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1234567890',
      profileUrl: null,
      staffStatus: StaffStatus.ACTIVE,
      workerRoles: null,
      weeklyAvailability: JSON.stringify({
        monday: { available: true, start: '22:00', end: '10:00' },
        tuesday: { available: true, start: '22:00', end: '10:00' },
        wednesday: { available: true, start: '22:00', end: '10:00' },
        thursday: { available: true, start: '22:00', end: '10:00' },
        friday: { available: true, start: '22:00', end: '10:00' },
        saturday: { available: true, start: '22:00', end: '10:00' },
        sunday: { available: true, start: '22:00', end: '10:00' }
      }),
      hourlyRate: 25.00
    },
    
    // Manager
    {
      username: 'manager1',
      email: 'manager@nightrestaurant.com',
      passwordHash: await bcrypt.hash('password123', 10),
      roles: ['manager'],
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1234567891',
      profileUrl: null,
      staffStatus: StaffStatus.ACTIVE,
      workerRoles: ['manager', 'server'],
      weeklyAvailability: JSON.stringify({
        monday: { available: true, start: '22:00', end: '10:00' },
        tuesday: { available: true, start: '22:00', end: '10:00' },
        wednesday: { available: true, start: '22:00', end: '10:00' },
        thursday: { available: true, start: '22:00', end: '10:00' },
        friday: { available: true, start: '22:00', end: '10:00' },
        saturday: { available: false, start: null, end: null },
        sunday: { available: false, start: null, end: null }
      }),
      hourlyRate: 22.00
    },
    
    // Staff Members - Servers  
    {
      username: 'server1',
      email: 'mike.server@nightrestaurant.com',
      passwordHash: await bcrypt.hash('password123', 10),
      roles: ['staff'],
      firstName: 'Mike',
      lastName: 'Davis',
      phone: '+1234567892',
      profileUrl: null,
      staffStatus: StaffStatus.ACTIVE,
      workerRoles: ['server'],
      weeklyAvailability: JSON.stringify({
        monday: { available: true, start: '22:00', end: '10:00' },
        tuesday: { available: true, start: '22:00', end: '10:00' },
        wednesday: { available: true, start: '22:00', end: '10:00' },
        thursday: { available: false, start: null, end: null },
        friday: { available: true, start: '22:00', end: '10:00' },
        saturday: { available: true, start: '22:00', end: '10:00' },
        sunday: { available: true, start: '22:00', end: '10:00' }
      }),
      hourlyRate: 18.00
    },
    
    {
      username: 'server2',
      email: 'lisa.server@nightrestaurant.com',
      passwordHash: await bcrypt.hash('password123', 10),
      roles: ['staff'],
      firstName: 'Lisa',
      lastName: 'Anderson',
      phone: '+1234567893',
      profileUrl: null,
      staffStatus: StaffStatus.ACTIVE,
      workerRoles: ['server'],
      weeklyAvailability: JSON.stringify({
        monday: { available: false, start: null, end: null },
        tuesday: { available: true, start: '22:00', end: '10:00' },
        wednesday: { available: true, start: '22:00', end: '10:00' },
        thursday: { available: true, start: '22:00', end: '10:00' },
        friday: { available: true, start: '22:00', end: '10:00' },
        saturday: { available: true, start: '22:00', end: '10:00' },
        sunday: { available: false, start: null, end: null }
      }),
      hourlyRate: 18.50
    },
    
    {
      username: 'server3',
      email: 'james.server@nightrestaurant.com',
      passwordHash: await bcrypt.hash('password123', 10),
      roles: ['staff'],
      firstName: 'James',
      lastName: 'Wilson',
      phone: '+1234567894',
      profileUrl: null,
      staffStatus: StaffStatus.ACTIVE,
      workerRoles: ['server', 'bartender'],
      weeklyAvailability: JSON.stringify({
        monday: { available: true, start: '22:00', end: '10:00' },
        tuesday: { available: false, start: null, end: null },
        wednesday: { available: true, start: '22:00', end: '10:00' },
        thursday: { available: true, start: '22:00', end: '10:00' },
        friday: { available: true, start: '22:00', end: '10:00' },
        saturday: { available: true, start: '22:00', end: '10:00' },
        sunday: { available: true, start: '22:00', end: '10:00' }
      }),
      hourlyRate: 19.00
    },
    
    // Staff Members - Cooks
    {
      username: 'cook1',
      email: 'carlos.cook@nightrestaurant.com',
      passwordHash: await bcrypt.hash('password123', 10),
      roles: ['staff'],
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      phone: '+1234567895',
      profileUrl: null,
      staffStatus: StaffStatus.ACTIVE,
      workerRoles: ['cook'],
      weeklyAvailability: JSON.stringify({
        monday: { available: true, start: '22:00', end: '10:00' },
        tuesday: { available: true, start: '22:00', end: '10:00' },
        wednesday: { available: true, start: '22:00', end: '10:00' },
        thursday: { available: true, start: '22:00', end: '10:00' },
        friday: { available: false, start: null, end: null },
        saturday: { available: true, start: '22:00', end: '10:00' },
        sunday: { available: true, start: '22:00', end: '10:00' }
      }),
      hourlyRate: 20.00
    },
    
    {
      username: 'cook2',
      email: 'maria.cook@nightrestaurant.com',
      passwordHash: await bcrypt.hash('password123', 10),
      roles: ['staff'],
      firstName: 'Maria',
      lastName: 'Garcia',
      phone: '+1234567896',
      profileUrl: null,
      staffStatus: StaffStatus.ACTIVE,
      workerRoles: ['cook'],
      weeklyAvailability: JSON.stringify({
        monday: { available: false, start: null, end: null },
        tuesday: { available: true, start: '22:00', end: '10:00' },
        wednesday: { available: false, start: null, end: null },
        thursday: { available: true, start: '22:00', end: '10:00' },
        friday: { available: true, start: '22:00', end: '10:00' },
        saturday: { available: true, start: '22:00', end: '10:00' },
        sunday: { available: true, start: '22:00', end: '10:00' }
      }),
      hourlyRate: 20.50
    },
    
    // One unavailable staff member
    {
      username: 'server_inactive',
      email: 'inactive@nightrestaurant.com',
      passwordHash: await bcrypt.hash('password123', 10),
      roles: ['staff'],
      firstName: 'John',
      lastName: 'Inactive',
      phone: '+1234567897',
      profileUrl: null,
      staffStatus: StaffStatus.UNAVAILABLE,
      workerRoles: ['server'],
      weeklyAvailability: JSON.stringify({
        monday: { available: false, start: null, end: null },
        tuesday: { available: false, start: null, end: null },
        wednesday: { available: false, start: null, end: null },
        thursday: { available: false, start: null, end: null },
        friday: { available: false, start: null, end: null },
        saturday: { available: false, start: null, end: null },
        sunday: { available: false, start: null, end: null }
      }),
      hourlyRate: 18.00
    },
    
    // Customer Users
    {
      username: 'customer1',
      email: 'john.customer@email.com',
      passwordHash: await bcrypt.hash('password123', 10),
      roles: ['customer'],
      firstName: 'John',
      lastName: 'Customer',
      phone: '+1234567898',
      profileUrl: null,
      staffStatus: null,
      workerRoles: null,
      weeklyAvailability: null,
      hourlyRate: null
    },
    
    {
      username: 'customer2',
      email: 'jane.customer@email.com',
      passwordHash: await bcrypt.hash('password123', 10),
      roles: ['customer'],
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1234567899',
      profileUrl: null,
      staffStatus: null,
      workerRoles: null,
      weeklyAvailability: null,
      hourlyRate: null
    },
    
    {
      username: 'customer3',
      email: 'bob.customer@email.com',
      passwordHash: await bcrypt.hash('password123', 10),
      roles: ['customer'],
      firstName: 'Bob',
      lastName: 'Johnson',
      phone: '+1234567900',
      profileUrl: null,
      staffStatus: null,
      workerRoles: null,
      weeklyAvailability: null,
      hourlyRate: null
    }
  ];
  
  await userRepository.save(users);
  console.log(`Created ${users.length} users`);
}
