import { AppDataSource } from '../data-source';
import { User } from '../models/User';
import { MenuItem } from '../models/MenuItem';
import { ShiftTemplate } from '../models/ShiftTemplate';
import { StaffStatus, ShiftTiming } from '../models/enums';
import * as bcrypt from 'bcrypt';

export const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');

  try {
    // Initialize data source if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepository = AppDataSource.getRepository(User);
    const menuItemRepository = AppDataSource.getRepository(MenuItem);
    const shiftTemplateRepository = AppDataSource.getRepository(ShiftTemplate);

    // Clear existing data by checking if tables exist and have data
    console.log('🗑️ Clearing existing data...');
    
    try {
      // Clear all tables that might have foreign key dependencies
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      
      // Check if we need to clear data (if tables exist and have records)
      const menuItemCount = await menuItemRepository.count();
      const userCount = await userRepository.count();
      const shiftTemplateCount = await shiftTemplateRepository.count();
      
      if (menuItemCount > 0 || userCount > 0 || shiftTemplateCount > 0) {
        console.log('📊 Found existing data, clearing...');
        // Use CASCADE to handle foreign key dependencies in PostgreSQL
        await queryRunner.query('TRUNCATE TABLE "menu_item", "user", "shift_template" RESTART IDENTITY CASCADE');
      } else {
        console.log('📋 No existing data found, proceeding with seeding...');
      }
      
      await queryRunner.release();
    } catch (error) {
      console.log('⚠️  Using alternative method to clear data...');
      // Fallback: Delete records instead of truncating
      const existingMenuItems = await menuItemRepository.find();
      const existingUsers = await userRepository.find();
      
      if (existingMenuItems.length > 0) {
        await menuItemRepository.remove(existingMenuItems);
      }
      if (existingUsers.length > 0) {
        await userRepository.remove(existingUsers);
      }
    }

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create users
    console.log('👥 Creating users...');

    // 1 Admin
    const admin = userRepository.create({
      username: 'admin1',
      email: 'admin1@dimsum.com',
      passwordHash: hashedPassword,
      roles: ['admin'],
      firstName: 'Admin',
      lastName: 'User',
      phone: '+65-1234-5678',
      staffStatus: StaffStatus.ACTIVE,
      workerRoles: ['admin'],
      weeklyAvailability: JSON.stringify({
        monday: { available: true, startTime: '08:00', endTime: '18:00' },
        tuesday: { available: true, startTime: '08:00', endTime: '18:00' },
        wednesday: { available: true, startTime: '08:00', endTime: '18:00' },
        thursday: { available: true, startTime: '08:00', endTime: '18:00' },
        friday: { available: true, startTime: '08:00', endTime: '18:00' },
        saturday: { available: true, startTime: '09:00', endTime: '17:00' },
        sunday: { available: false, startTime: null, endTime: null }
      })
    });

    // 2 Managers
    const manager1 = userRepository.create({
      username: 'manager1',
      email: 'manager1@dimsum.com',
      passwordHash: hashedPassword,
      roles: ['manager'],
      firstName: 'Alice',
      lastName: 'Wong',
      phone: '+65-2345-6789',
      staffStatus: StaffStatus.ACTIVE,
      workerRoles: ['manager'],
      weeklyAvailability: JSON.stringify({
        monday: { available: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
        thursday: { available: true, startTime: '09:00', endTime: '17:00' },
        friday: { available: true, startTime: '09:00', endTime: '17:00' },
        saturday: { available: true, startTime: '10:00', endTime: '16:00' },
        sunday: { available: false, startTime: null, endTime: null }
      })
    });

    const manager2 = userRepository.create({
      username: 'manager2',
      email: 'manager2@dimsum.com',
      passwordHash: hashedPassword,
      roles: ['manager'],
      firstName: 'David',
      lastName: 'Chen',
      phone: '+65-3456-7890',
      staffStatus: StaffStatus.ACTIVE,
      workerRoles: ['manager'],
      weeklyAvailability: JSON.stringify({
        monday: { available: true, startTime: '10:00', endTime: '18:00' },
        tuesday: { available: true, startTime: '10:00', endTime: '18:00' },
        wednesday: { available: true, startTime: '10:00', endTime: '18:00' },
        thursday: { available: true, startTime: '10:00', endTime: '18:00' },
        friday: { available: true, startTime: '10:00', endTime: '18:00' },
        saturday: { available: true, startTime: '10:00', endTime: '18:00' },
        sunday: { available: true, startTime: '12:00', endTime: '16:00' }
      })
    });

    // 5 Staff members
    const cook1 = userRepository.create({
      username: 'cook1',
      email: 'cook1@dimsum.com',
      passwordHash: hashedPassword,
      roles: ['staff'],
      firstName: 'Michael',
      lastName: 'Lee',
      phone: '+65-4567-8901',
      staffStatus: StaffStatus.ACTIVE,
      workerRoles: ['cook'],
      weeklyAvailability: JSON.stringify({
        monday: { available: true, startTime: '06:00', endTime: '14:00' },
        tuesday: { available: true, startTime: '06:00', endTime: '14:00' },
        wednesday: { available: true, startTime: '06:00', endTime: '14:00' },
        thursday: { available: true, startTime: '06:00', endTime: '14:00' },
        friday: { available: true, startTime: '06:00', endTime: '14:00' },
        saturday: { available: false, startTime: null, endTime: null },
        sunday: { available: false, startTime: null, endTime: null }
      })
    });

    const cook2 = userRepository.create({
      username: 'cook2',
      email: 'cook2@dimsum.com',
      passwordHash: hashedPassword,
      roles: ['staff'],
      firstName: 'Sarah',
      lastName: 'Tan',
      phone: '+65-5678-9012',
      staffStatus: StaffStatus.ACTIVE,
      workerRoles: ['cook'],
      weeklyAvailability: JSON.stringify({
        monday: { available: false, startTime: null, endTime: null },
        tuesday: { available: false, startTime: null, endTime: null },
        wednesday: { available: true, startTime: '14:00', endTime: '22:00' },
        thursday: { available: true, startTime: '14:00', endTime: '22:00' },
        friday: { available: true, startTime: '14:00', endTime: '22:00' },
        saturday: { available: true, startTime: '10:00', endTime: '18:00' },
        sunday: { available: true, startTime: '10:00', endTime: '18:00' }
      })
    });

    const server1 = userRepository.create({
      username: 'server1',
      email: 'server1@dimsum.com',
      passwordHash: hashedPassword,
      roles: ['staff'],
      firstName: 'Jenny',
      lastName: 'Lim',
      phone: '+65-6789-0123',
      staffStatus: StaffStatus.ACTIVE,
      workerRoles: ['server'],
      weeklyAvailability: JSON.stringify({
        monday: { available: true, startTime: '11:00', endTime: '19:00' },
        tuesday: { available: true, startTime: '11:00', endTime: '19:00' },
        wednesday: { available: true, startTime: '11:00', endTime: '19:00' },
        thursday: { available: true, startTime: '11:00', endTime: '19:00' },
        friday: { available: true, startTime: '11:00', endTime: '19:00' },
        saturday: { available: true, startTime: '10:00', endTime: '20:00' },
        sunday: { available: true, startTime: '10:00', endTime: '20:00' }
      })
    });

    const server2 = userRepository.create({
      username: 'server2',
      email: 'server2@dimsum.com',
      passwordHash: hashedPassword,
      roles: ['staff'],
      firstName: 'Kevin',
      lastName: 'Ng',
      phone: '+65-7890-1234',
      staffStatus: StaffStatus.ACTIVE,
      workerRoles: ['server'],
      weeklyAvailability: JSON.stringify({
        monday: { available: true, startTime: '18:00', endTime: '23:00' },
        tuesday: { available: true, startTime: '18:00', endTime: '23:00' },
        wednesday: { available: true, startTime: '18:00', endTime: '23:00' },
        thursday: { available: true, startTime: '18:00', endTime: '23:00' },
        friday: { available: true, startTime: '18:00', endTime: '23:00' },
        saturday: { available: true, startTime: '18:00', endTime: '23:00' },
        sunday: { available: false, startTime: null, endTime: null }
      })
    });

    const cleaner1 = userRepository.create({
      username: 'cleaner1',
      email: 'cleaner1@dimsum.com',
      passwordHash: hashedPassword,
      roles: ['staff'],
      firstName: 'Maria',
      lastName: 'Santos',
      phone: '+65-8901-2345',
      staffStatus: StaffStatus.ACTIVE,
      workerRoles: ['cleaner'],
      weeklyAvailability: JSON.stringify({
        monday: { available: true, startTime: '05:00', endTime: '13:00' },
        tuesday: { available: true, startTime: '05:00', endTime: '13:00' },
        wednesday: { available: true, startTime: '05:00', endTime: '13:00' },
        thursday: { available: true, startTime: '05:00', endTime: '13:00' },
        friday: { available: true, startTime: '05:00', endTime: '13:00' },
        saturday: { available: true, startTime: '06:00', endTime: '14:00' },
        sunday: { available: true, startTime: '06:00', endTime: '14:00' }
      })
    });

    // 2 Customers
    const customer1 = userRepository.create({
      username: 'customer1',
      email: 'customer1@gmail.com',
      passwordHash: hashedPassword,
      roles: ['customer'],
      firstName: 'John',
      lastName: 'Smith',
      phone: '+65-9012-3456',
      staffStatus: null,
      workerRoles: null,
      weeklyAvailability: null
    });

    const customer2 = userRepository.create({
      username: 'customer2',
      email: 'customer2@gmail.com',
      passwordHash: hashedPassword,
      roles: ['customer'],
      firstName: 'Emma',
      lastName: 'Johnson',
      phone: '+65-0123-4567',
      staffStatus: null,
      workerRoles: null,
      weeklyAvailability: null
    });

    // Save all users
    await userRepository.save([admin, manager1, manager2, cook1, cook2, server1, server2, cleaner1, customer1, customer2]);

    // Create menu items
    console.log('🍽️ Creating menu items...');

    // Dim Sum Food Items (based on The Dim Sum Place menu)
    const foodItems = [
      {
        name: 'Har Gow (Prawn Dumplings)',
        category: 'food',
        price: 6.80,
        description: 'Traditional steamed prawn dumplings with translucent wrapper',
        preparationTimeMin: 15,
        costOfGoods: 3.40,
        allergens: ['shellfish'],
        qtyOnHand: 30,
        reorderThreshold: 6
      },
      {
        name: 'Siu Mai (Pork & Prawn Dumplings)',
        category: 'food',
        price: 6.50,
        description: 'Classic open-topped steamed dumplings with pork and prawn',
        preparationTimeMin: 15,
        costOfGoods: 3.25,
        allergens: ['shellfish', 'pork'],
        qtyOnHand: 25,
        reorderThreshold: 5
      },
      {
        name: 'Char Siu Bao (BBQ Pork Buns)',
        category: 'food',
        price: 7.20,
        description: 'Fluffy steamed buns filled with sweet BBQ pork',
        preparationTimeMin: 20,
        costOfGoods: 3.60,
        allergens: ['gluten', 'pork'],
        qtyOnHand: 20,
        reorderThreshold: 4
      },
      {
        name: 'Xiao Long Bao (Soup Dumplings)',
        category: 'food',
        price: 8.50,
        description: 'Delicate dumplings filled with pork and hot broth',
        preparationTimeMin: 25,
        costOfGoods: 4.25,
        allergens: ['gluten', 'pork'],
        qtyOnHand: 15,
        reorderThreshold: 3
      },
      {
        name: 'Cheong Fun (Rice Noodle Rolls)',
        category: 'food',
        price: 7.80,
        description: 'Silky rice noodle rolls with choice of filling',
        preparationTimeMin: 10,
        costOfGoods: 3.90,
        allergens: ['soy'],
        qtyOnHand: 18,
        reorderThreshold: 4
      },
      {
        name: 'Wu Gok (Taro Croquettes)',
        category: 'food',
        price: 6.20,
        description: 'Deep-fried taro dumplings with savory pork filling',
        preparationTimeMin: 18,
        costOfGoods: 3.10,
        allergens: ['gluten', 'pork'],
        qtyOnHand: 22,
        reorderThreshold: 4
      },
      {
        name: 'Lor Mai Gai (Glutinous Rice in Lotus Leaf)',
        category: 'food',
        price: 9.50,
        description: 'Sticky rice with chicken, mushrooms wrapped in lotus leaf',
        preparationTimeMin: 30,
        costOfGoods: 4.75,
        allergens: ['gluten'],
        qtyOnHand: 12,
        reorderThreshold: 2
      },
      {
        name: 'Jin Deui (Sesame Balls)',
        category: 'food',
        price: 5.80,
        description: 'Deep-fried glutinous rice balls with red bean paste',
        preparationTimeMin: 15,
        costOfGoods: 2.90,
        allergens: ['sesame', 'gluten'],
        qtyOnHand: 28,
        reorderThreshold: 6
      },
      {
        name: 'Egg Tarts',
        category: 'food',
        price: 5.50,
        description: 'Classic Portuguese-style custard tarts with flaky pastry',
        preparationTimeMin: 20,
        costOfGoods: 2.75,
        allergens: ['eggs', 'dairy', 'gluten'],
        qtyOnHand: 35,
        reorderThreshold: 7
      },
      {
        name: 'Turnip Cake (Lo Bak Go)',
        category: 'food',
        price: 6.80,
        description: 'Pan-fried radish cake with Chinese sausage',
        preparationTimeMin: 12,
        costOfGoods: 3.40,
        allergens: ['gluten'],
        qtyOnHand: 20,
        reorderThreshold: 4
      }
    ];

    // Tea & Drinks Items
    const drinkItems = [
      {
        name: 'Jasmine Tea',
        category: 'drinks',
        price: 4.50,
        description: 'Fragrant jasmine green tea, served hot',
        preparationTimeMin: 5,
        costOfGoods: 1.50,
        allergens: [],
        qtyOnHand: 50,
        reorderThreshold: 10
      },
      {
        name: 'Pu-erh Tea',
        category: 'drinks',
        price: 5.20,
        description: 'Aged dark tea with rich, earthy flavor',
        preparationTimeMin: 5,
        costOfGoods: 2.10,
        allergens: [],
        qtyOnHand: 45,
        reorderThreshold: 9
      },
      {
        name: 'Oolong Tea',
        category: 'drinks',
        price: 4.80,
        description: 'Traditional semi-fermented tea with complex flavor',
        preparationTimeMin: 5,
        costOfGoods: 1.80,
        allergens: [],
        qtyOnHand: 40,
        reorderThreshold: 8
      },
      {
        name: 'Chrysanthemum Tea',
        category: 'drinks',
        price: 4.20,
        description: 'Cooling herbal tea made from dried chrysanthemum flowers',
        preparationTimeMin: 8,
        costOfGoods: 1.40,
        allergens: [],
        qtyOnHand: 38,
        reorderThreshold: 8
      },
      {
        name: 'Chinese Herbal Tea',
        category: 'drinks',
        price: 5.80,
        description: 'Traditional blend of cooling herbs, served chilled',
        preparationTimeMin: 10,
        costOfGoods: 2.40,
        allergens: [],
        qtyOnHand: 25,
        reorderThreshold: 5
      }
    ];

    // Create and save menu items
    const allMenuItems = [...foodItems, ...drinkItems].map(item => 
      menuItemRepository.create({
        ...item,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    );

    await menuItemRepository.save(allMenuItems);

    // Create shift templates
    console.log('⏰ Creating shift templates...');

    const shiftTemplates = [
      {
        name: ShiftTiming.EVENING,
        startTime: '22:00:00',
        endTime: '02:00:00'
      },
      {
        name: ShiftTiming.MIDNIGHT,
        startTime: '02:00:00',
        endTime: '06:00:00'
      },
      {
        name: ShiftTiming.EARLY_MORNING,
        startTime: '06:00:00',
        endTime: '10:00:00'
      }
    ];

    const allShiftTemplates = shiftTemplates.map(template => 
      shiftTemplateRepository.create(template)
    );

    await shiftTemplateRepository.save(allShiftTemplates);

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created ${allMenuItems.length} menu items, 10 users, and ${allShiftTemplates.length} shift templates`);
    
    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};