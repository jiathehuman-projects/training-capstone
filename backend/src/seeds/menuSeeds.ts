/**
 * Menu Item Seeds
 * Creates comprehensive menu data with food and drink categories
 */

import { AppDataSource } from '../data-source';
import { MenuItem } from '../models/MenuItem';

export async function seedMenuItems() {
  const menuItemRepository = AppDataSource.getRepository(MenuItem);
  
  const menuItems = [
    // DIM SUM FOOD MENU - Authentic Midnight Dim Sum
    {
      name: 'Har Gow (Shrimp Dumplings)',
      category: 'Dumplings (餃子)',
      price: 8.99,
      description: 'Traditional crystal shrimp dumplings with translucent wrapper, filled with fresh prawns and bamboo shoots.',
      photoUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400',
      preparationTimeMin: 12,
      costOfGoods: 3.50,
      allergens: ['shellfish'],
      qtyOnHand: 80,
      reorderThreshold: 15,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Siu Mai (Pork Dumplings)',
      category: 'Dumplings (餃子)',
      price: 7.99,
      description: 'Classic steamed pork and shrimp dumplings topped with fish roe and carrot.',
      photoUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d96b?w=400',
      preparationTimeMin: 10,
      costOfGoods: 3.25,
      allergens: ['shellfish', 'eggs'],
      qtyOnHand: 90,
      reorderThreshold: 20,
      isActive: true,
      promoPercent: 15,
      promoStartDate: new Date('2025-09-29'),
      promoEndDate: new Date('2025-10-06')
    },
    
    {
      name: 'Char Siu Bao (BBQ Pork Buns)',
      category: 'Buns (包子)',
      price: 9.99,
      description: 'Fluffy steamed buns filled with sweet and savory barbecued pork in a rich sauce.',
      photoUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
      preparationTimeMin: 15,
      costOfGoods: 4.25,
      allergens: ['gluten', 'soy'],
      qtyOnHand: 60,
      reorderThreshold: 12,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Xiaolongbao (Soup Dumplings)',
      category: 'Dumplings (餃子)',
      price: 12.99,
      description: 'Delicate steamed dumplings filled with seasoned pork and hot savory broth.',
      photoUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400',
      preparationTimeMin: 18,
      costOfGoods: 5.50,
      allergens: ['gluten', 'soy'],
      qtyOnHand: 45,
      reorderThreshold: 10,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Cheong Fun (Rice Rolls)',
      category: 'Rice Rolls (腸粉)',
      price: 10.99,
      description: 'Silky rice noodle rolls filled with shrimp or char siu, served with sweet soy sauce.',
      photoUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
      preparationTimeMin: 8,
      costOfGoods: 4.75,
      allergens: ['shellfish', 'soy'],
      qtyOnHand: 35,
      reorderThreshold: 8,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Lo Mai Gai (Sticky Rice Chicken)',
      category: 'Small Plates',
      price: 11.99,
      description: 'Glutinous rice wrapped in lotus leaf with chicken, Chinese sausage, and mushrooms.',
      photoUrl: 'https://images.unsplash.com/photo-1559847844-d0c6ca2d0b3c?w=400',
      preparationTimeMin: 20,
      costOfGoods: 5.25,
      allergens: ['soy'],
      qtyOnHand: 25,
      reorderThreshold: 6,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Wu Gok (Taro Dumplings)',
      category: 'Dumplings (餃子)',
      price: 8.50,
      description: 'Deep-fried taro dumplings with crispy exterior and creamy taro filling with diced pork.',
      photoUrl: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400',
      preparationTimeMin: 12,
      costOfGoods: 3.75,
      allergens: ['gluten'],
      qtyOnHand: 40,
      reorderThreshold: 10,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Phoenix Claws (Chicken Feet)',
      category: 'Small Plates',
      price: 7.50,
      description: 'Braised chicken feet in black bean sauce, a dim sum delicacy with rich, savory flavors.',
      photoUrl: 'https://images.unsplash.com/photo-1582878076428-5c0e80b4e7a9?w=400',
      preparationTimeMin: 25,
      costOfGoods: 2.75,
      allergens: ['soy'],
      qtyOnHand: 30,
      reorderThreshold: 8,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Turnip Cake (Lo Bak Go)',
      category: 'Small Plates',
      price: 6.99,
      description: 'Pan-fried radish cake with Chinese sausage, dried shrimp, and mushrooms.',
      photoUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d96b?w=400',
      preparationTimeMin: 10,
      costOfGoods: 2.50,
      allergens: ['shellfish', 'soy'],
      qtyOnHand: 50,
      reorderThreshold: 12,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Egg Tart (Dan Tat)',
      category: 'Desserts',
      price: 5.99,
      description: 'Flaky pastry shell filled with silky smooth egg custard, baked to golden perfection.',
      photoUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      preparationTimeMin: 8,
      costOfGoods: 2.25,
      allergens: ['gluten', 'dairy', 'eggs'],
      qtyOnHand: 60,
      reorderThreshold: 15,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    // OUT OF STOCK ITEM
    {
      name: 'Mango Pudding',
      category: 'Desserts',
      price: 6.50,
      description: 'Creamy mango pudding topped with fresh mango pieces and coconut flakes.',
      photoUrl: 'https://images.unsplash.com/photo-1571167530149-c9a0be52a4db?w=400',
      preparationTimeMin: 5,
      costOfGoods: 2.75,
      allergens: ['dairy'],
      qtyOnHand: 0,
      reorderThreshold: 8,
      isActive: false,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    // DIM SUM DRINK MENU - Traditional Chinese Teas & Modern Beverages
    {
      name: 'Jasmine Tea',
      category: 'Chinese Tea',
      price: 4.99,
      description: 'Traditional jasmine green tea, the perfect complement to dim sum. Served hot in a traditional teapot.',
      photoUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
      preparationTimeMin: 3,
      costOfGoods: 1.25,
      allergens: [],
      qtyOnHand: 100,
      reorderThreshold: 20,
      isActive: true,
      promoPercent: 20,
      promoStartDate: new Date('2025-09-29'),
      promoEndDate: new Date('2025-10-13')
    },
    
    {
      name: 'Pu-erh Tea',
      category: 'Chinese Tea',
      price: 6.99,
      description: 'Aged dark tea with rich, earthy flavor. Known for its digestive properties, perfect after a dim sum meal.',
      photoUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
      preparationTimeMin: 4,
      costOfGoods: 2.25,
      allergens: [],
      qtyOnHand: 80,
      reorderThreshold: 15,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Oolong Tea',
      category: 'Chinese Tea',
      price: 5.99,
      description: 'Semi-fermented tea with a complex flavor profile, balancing the richness of black tea with the freshness of green tea.',
      photoUrl: 'https://images.unsplash.com/photo-1571167530149-c9a0be52a4db?w=400',
      preparationTimeMin: 3,
      costOfGoods: 1.75,
      allergens: [],
      qtyOnHand: 90,
      reorderThreshold: 18,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Chrysanthemum Tea',
      category: 'Chinese Tea',
      price: 4.50,
      description: 'Cooling herbal tea made from dried chrysanthemum flowers. Naturally caffeine-free and refreshing.',
      photoUrl: 'https://images.unsplash.com/photo-1605540443725-7e216f615d9f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      preparationTimeMin: 4,
      costOfGoods: 1.50,
      allergens: [],
      qtyOnHand: 70,
      reorderThreshold: 14,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Hong Kong Milk Tea',
      category: 'Specialty Drinks',
      price: 6.50,
      description: 'Rich and creamy tea made with black tea and evaporated milk, strained through silk stockings.',
      photoUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
      preparationTimeMin: 5,
      costOfGoods: 2.75,
      allergens: ['dairy'],
      qtyOnHand: 65,
      reorderThreshold: 12,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Lychee Sparkling Water',
      category: 'Specialty Drinks',
      price: 5.99,
      description: 'Refreshing sparkling water infused with sweet lychee flavor and garnished with fresh lychee.',
      photoUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
      preparationTimeMin: 2,
      costOfGoods: 2.25,
      allergens: [],
      qtyOnHand: 85,
      reorderThreshold: 16,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Winter Melon Tea',
      category: 'Chinese Tea',
      price: 4.99,
      description: 'Sweet and refreshing tea made from winter melon, served hot or cold.',
      photoUrl: 'https://images.unsplash.com/photo-1571167530149-c9a0be52a4db?w=400',
      preparationTimeMin: 3,
      costOfGoods: 1.75,
      allergens: [],
      qtyOnHand: 75,
      reorderThreshold: 15,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Fresh Soy Milk',
      category: 'Specialty Drinks',
      price: 3.99,
      description: 'Creamy homemade soy milk, served hot or cold. A healthy and traditional Chinese beverage.',
      photoUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c295JTIwbWlsa3xlbnwwfDB8MHx8fDA%3D',
      preparationTimeMin: 2,
      costOfGoods: 1.25,
      allergens: ['soy'],
      qtyOnHand: 95,
      reorderThreshold: 20,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Longan Red Date Tea',
      category: 'Chinese Tea',
      price: 5.50,
      description: 'Nourishing herbal tea with longan and red dates, known for its health benefits and natural sweetness.',
      photoUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
      preparationTimeMin: 6,
      costOfGoods: 2.00,
      allergens: [],
      qtyOnHand: 55,
      reorderThreshold: 12,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Coconut Water',
      category: 'Specialty Drinks',
      price: 4.25,
      description: 'Fresh coconut water served in a chilled glass, naturally hydrating and refreshing.',
      photoUrl: 'https://media.istockphoto.com/id/174757029/photo/coconut-water-and-nut.webp?a=1&b=1&s=612x612&w=0&k=20&c=dtDA-nLxGiEILvNQhIZ-occUOs6pUqNIKOXUOhhcQf8=',
      preparationTimeMin: 1,
      costOfGoods: 1.75,
      allergens: [],
      qtyOnHand: 80,
      reorderThreshold: 16,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    // OUT OF STOCK DRINK
    {
      name: 'Premium Dragon Well Tea',
      category: 'Chinese Tea',
      price: 12.99,
      description: 'Premium grade Longjing green tea with delicate flavor and beautiful flat leaves.',
      photoUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
      preparationTimeMin: 4,
      costOfGoods: 5.50,
      allergens: [],
      qtyOnHand: 0,
      reorderThreshold: 5,
      isActive: false,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    }
  ];
  
  await menuItemRepository.save(menuItems);
  console.log(`Created ${menuItems.length} menu items`);
}