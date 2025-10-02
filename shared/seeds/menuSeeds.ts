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
      photoUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500',
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
      photoUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500',
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
      description: 'Fluffy steamed buns filled with sweet and savory barbecued pork in a glossy sauce.',
      photoUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500',
      preparationTimeMin: 15,
      costOfGoods: 4.25,
      allergens: ['gluten', 'soy'],
      qtyOnHand: 70,
      reorderThreshold: 18,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Vegetable Spring Rolls',
      category: 'Small Plates',
      price: 6.99,
      description: 'Crispy golden spring rolls filled with fresh vegetables and served with sweet and sour sauce.',
      photoUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500',
      preparationTimeMin: 8,
      costOfGoods: 2.75,
      allergens: ['gluten'],
      qtyOnHand: 100,
      reorderThreshold: 25,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Hainanese Chicken Rice',
      category: 'Rice Dishes',
      price: 14.99,
      description: 'Tender poached chicken served with fragrant rice cooked in chicken broth, accompanied by ginger-scallion sauce.',
      photoUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500',
      preparationTimeMin: 25,
      costOfGoods: 6.50,
      allergens: [],
      qtyOnHand: 45,
      reorderThreshold: 10,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Beef Brisket Noodle Soup',
      category: 'Noodle Soups',
      price: 13.99,
      description: 'Slow-braised beef brisket in aromatic broth with fresh noodles and bok choy.',
      photoUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
      preparationTimeMin: 20,
      costOfGoods: 5.75,
      allergens: ['gluten'],
      qtyOnHand: 35,
      reorderThreshold: 8,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Congee with Century Egg',
      category: 'Rice Dishes',
      price: 8.99,
      description: 'Silky smooth rice porridge topped with century egg, lean pork, and preserved vegetables.',
      photoUrl: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=500',
      preparationTimeMin: 15,
      costOfGoods: 3.25,
      allergens: ['eggs'],
      qtyOnHand: 60,
      reorderThreshold: 15,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Xiaolongbao (Soup Dumplings)',
      category: 'Dumplings (餃子)',
      price: 11.99,
      description: 'Delicate steamed dumplings filled with seasoned pork and hot savory broth.',
      photoUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500',
      preparationTimeMin: 18,
      costOfGoods: 5.25,
      allergens: ['gluten'],
      qtyOnHand: 40,
      reorderThreshold: 12,
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
      photoUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500',
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
      photoUrl: 'https://images.unsplash.com/photo-1605540443725-7e216f615d9f?w=500',
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
    
    {
      name: 'Wonton Soup',
      category: 'Noodle Soups',
      price: 10.99,
      description: 'Fresh wontons filled with seasoned pork and shrimp in clear chicken broth.',
      photoUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500',
      preparationTimeMin: 12,
      costOfGoods: 4.50,
      allergens: ['shellfish', 'gluten'],
      qtyOnHand: 55,
      reorderThreshold: 12,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Yang Chow Fried Rice',
      category: 'Rice Dishes',
      price: 12.99,
      description: 'Classic fried rice with shrimp, char siu, eggs, and mixed vegetables.',
      photoUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500',
      preparationTimeMin: 15,
      costOfGoods: 5.25,
      allergens: ['shellfish', 'eggs'],
      qtyOnHand: 80,
      reorderThreshold: 20,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Sweet and Sour Pork',
      category: 'Main Dishes',
      price: 15.99,
      description: 'Crispy battered pork with bell peppers, pineapple, and onions in tangy sweet and sour sauce.',
      photoUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500',
      preparationTimeMin: 18,
      costOfGoods: 6.75,
      allergens: ['gluten'],
      qtyOnHand: 30,
      reorderThreshold: 8,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    // BEVERAGES
    {
      name: 'Jasmine Tea (Pot)',
      category: 'Chinese Tea',
      price: 4.99,
      description: 'Fragrant jasmine tea served in traditional teapot, perfect for sharing.',
      photoUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500',
      preparationTimeMin: 3,
      costOfGoods: 1.25,
      allergens: [],
      qtyOnHand: 100,
      reorderThreshold: 20,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Dan Dan Noodles',
      category: 'Noodle Soups',
      price: 11.99,
      description: 'Spicy Sichuan noodles with minced pork, preserved vegetables, and peanut sauce.',
      photoUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
      preparationTimeMin: 14,
      costOfGoods: 4.75,
      allergens: ['gluten', 'peanuts'],
      qtyOnHand: 40,
      reorderThreshold: 10,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Fresh Lychee Juice',
      category: 'Fresh Juices',
      price: 5.99,
      description: 'Sweet and refreshing lychee juice made from fresh lychees.',
      photoUrl: 'https://images.unsplash.com/photo-1605540443725-7e216f615d9f?w=500',
      preparationTimeMin: 3,
      costOfGoods: 2.25,
      allergens: [],
      qtyOnHand: 70,
      reorderThreshold: 15,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Iced Milk Tea',
      category: 'Milk Tea',
      price: 4.99,
      description: 'Classic Hong Kong-style milk tea served over ice.',
      photoUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500',
      preparationTimeMin: 2,
      costOfGoods: 1.50,
      allergens: ['dairy'],
      qtyOnHand: 90,
      reorderThreshold: 18,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Fresh Lemon Water',
      category: 'Fresh Juices',
      price: 3.99,
      description: 'Refreshing lemon water with a hint of mint, served chilled.',
      photoUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500',
      preparationTimeMin: 2,
      costOfGoods: 1.25,
      allergens: [],
      qtyOnHand: 100,
      reorderThreshold: 20,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Mapo Tofu',
      category: 'Main Dishes',
      price: 13.99,
      description: 'Silky tofu in spicy Sichuan sauce with minced pork and fermented black beans.',
      photoUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500',
      preparationTimeMin: 16,
      costOfGoods: 4.25,
      allergens: ['soy'],
      qtyOnHand: 45,
      reorderThreshold: 12,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Hot Soy Milk',
      category: 'Traditional Drinks',
      price: 3.99,
      description: 'Warm, creamy soy milk sweetened with rock sugar, a traditional breakfast drink.',
      photoUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=500',
      preparationTimeMin: 3,
      costOfGoods: 1.00,
      allergens: ['soy'],
      qtyOnHand: 85,
      reorderThreshold: 20,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Kung Pao Chicken',
      category: 'Main Dishes',
      price: 14.99,
      description: 'Diced chicken stir-fried with peanuts, vegetables, and chili peppers in savory sauce.',
      photoUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500',
      preparationTimeMin: 17,
      costOfGoods: 5.50,
      allergens: ['peanuts', 'soy'],
      qtyOnHand: 35,
      reorderThreshold: 10,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Fresh Coconut Water',
      category: 'Fresh Juices',
      price: 6.99,
      description: 'Fresh coconut water served in a chilled glass, naturally hydrating and refreshing.',
      photoUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500',
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
      photoUrl: 'https://images.unsplash.com/photo-1597318281699-75eb9e8c5f3f?w=500',
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