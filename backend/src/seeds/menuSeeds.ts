/**
 * Menu Item Seeds
 * Creates comprehensive menu data with food and drink categories
 */

import { AppDataSource } from '../data-source';
import { MenuItem } from '../models/MenuItem';

export async function seedMenuItems() {
  const menuItemRepository = AppDataSource.getRepository(MenuItem);
  
  const menuItems = [
    // FOOD MENU - Late Night Comfort Food
    {
      name: 'Midnight Burger',
      category: 'food',
      price: 18.99,
      description: 'Double beef patty with cheese, lettuce, tomato, and our signature midnight sauce. Served with crispy fries.',
      photoUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      preparationTimeMin: 15,
      costOfGoods: 8.50,
      allergens: ['gluten', 'dairy'],
      qtyOnHand: 50,
      reorderThreshold: 10,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Night Owl Wings',
      category: 'food',
      price: 16.50,
      description: 'Buffalo wings with choice of hot, mild, or BBQ sauce. Served with celery sticks and blue cheese dip.',
      photoUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400',
      preparationTimeMin: 12,
      costOfGoods: 7.25,
      allergens: ['dairy'],
      qtyOnHand: 75,
      reorderThreshold: 15,
      isActive: true,
      promoPercent: 15,
      promoStartDate: new Date('2025-09-29'),
      promoEndDate: new Date('2025-10-06')
    },
    
    {
      name: 'Loaded Nachos Supreme',
      category: 'food',
      price: 14.99,
      description: 'Crispy tortilla chips loaded with cheese, jalapeños, sour cream, guacamole, and your choice of chicken or beef.',
      photoUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400',
      preparationTimeMin: 10,
      costOfGoods: 6.75,
      allergens: ['dairy'],
      qtyOnHand: 40,
      reorderThreshold: 8,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'After Hours Pizza',
      category: 'food',
      price: 22.99,
      description: '12" wood-fired pizza with pepperoni, mushrooms, bell peppers, and mozzarella cheese.',
      photoUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      preparationTimeMin: 18,
      costOfGoods: 9.50,
      allergens: ['gluten', 'dairy'],
      qtyOnHand: 30,
      reorderThreshold: 5,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Graveyard Shift Pasta',
      category: 'food',
      price: 19.50,
      description: 'Creamy alfredo pasta with grilled chicken, broccoli, and parmesan cheese.',
      photoUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d30e?w=400',
      preparationTimeMin: 14,
      costOfGoods: 8.25,
      allergens: ['gluten', 'dairy'],
      qtyOnHand: 35,
      reorderThreshold: 7,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Moonlight Fish & Chips',
      category: 'food',
      price: 17.99,
      description: 'Beer-battered cod served with golden fries, coleslaw, and tartar sauce.',
      photoUrl: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400',
      preparationTimeMin: 16,
      costOfGoods: 8.75,
      allergens: ['gluten', 'fish'],
      qtyOnHand: 25,
      reorderThreshold: 5,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Night Crawler Quesadilla',
      category: 'food',
      price: 13.99,
      description: 'Grilled chicken and cheese quesadilla served with salsa, sour cream, and guacamole.',
      photoUrl: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400',
      preparationTimeMin: 8,
      costOfGoods: 5.50,
      allergens: ['dairy'],
      qtyOnHand: 45,
      reorderThreshold: 10,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Vampire Steak',
      category: 'food',
      price: 28.99,
      description: '8oz ribeye steak cooked to perfection, served with mashed potatoes and seasonal vegetables.',
      photoUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
      preparationTimeMin: 25,
      costOfGoods: 15.50,
      allergens: ['dairy'],
      qtyOnHand: 20,
      reorderThreshold: 3,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Sleepwalker Salad',
      category: 'food',
      price: 12.99,
      description: 'Mixed greens with grilled chicken, cherry tomatoes, cucumber, and balsamic vinaigrette.',
      photoUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      preparationTimeMin: 6,
      costOfGoods: 4.75,
      allergens: [],
      qtyOnHand: 60,
      reorderThreshold: 12,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Owl Sandwich',
      category: 'food',
      price: 15.50,
      description: 'Grilled chicken breast with bacon, lettuce, tomato, and mayo on toasted sourdough.',
      photoUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400',
      preparationTimeMin: 10,
      costOfGoods: 6.25,
      allergens: ['gluten'],
      qtyOnHand: 40,
      reorderThreshold: 8,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    // OUT OF STOCK ITEM
    {
      name: 'Dawn Dessert Special',
      category: 'food',
      price: 9.99,
      description: 'Chocolate lava cake with vanilla ice cream and berry compote.',
      photoUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400',
      preparationTimeMin: 8,
      costOfGoods: 3.50,
      allergens: ['gluten', 'dairy', 'eggs'],
      qtyOnHand: 0,
      reorderThreshold: 5,
      isActive: false,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    // DRINK MENU - Cocktails, Non-Alcoholic, Coffee
    {
      name: 'Midnight Mojito',
      category: 'drink',
      price: 12.99,
      description: 'Classic mojito with fresh mint, lime, white rum, and a splash of soda water.',
      photoUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400',
      preparationTimeMin: 3,
      costOfGoods: 4.25,
      allergens: [],
      qtyOnHand: 80,
      reorderThreshold: 15,
      isActive: true,
      promoPercent: 20,
      promoStartDate: new Date('2025-09-29'),
      promoEndDate: new Date('2025-10-13')
    },
    
    {
      name: 'Night Owl Martini',
      category: 'drink',
      price: 14.50,
      description: 'Premium vodka martini with a twist of lemon, served chilled with olives.',
      photoUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400',
      preparationTimeMin: 2,
      costOfGoods: 5.75,
      allergens: [],
      qtyOnHand: 65,
      reorderThreshold: 12,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Vampire\'s Blood',
      category: 'drink',
      price: 13.99,
      description: 'Dark red cocktail with cranberry juice, pomegranate, vodka, and a splash of grenadine.',
      photoUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400',
      preparationTimeMin: 4,
      costOfGoods: 4.50,
      allergens: [],
      qtyOnHand: 55,
      reorderThreshold: 10,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Moonshine Whiskey Sour',
      category: 'drink',
      price: 11.99,
      description: 'Classic whiskey sour with bourbon, fresh lemon juice, and simple syrup.',
      photoUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400',
      preparationTimeMin: 3,
      costOfGoods: 4.00,
      allergens: [],
      qtyOnHand: 70,
      reorderThreshold: 14,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Starlight Beer',
      category: 'drink',
      price: 6.99,
      description: 'Local craft beer with hoppy flavor and citrus notes. Perfect for late night dining.',
      photoUrl: 'https://images.unsplash.com/photo-1618885472179-5e474019f2c9?w=400',
      preparationTimeMin: 1,
      costOfGoods: 2.50,
      allergens: ['gluten'],
      qtyOnHand: 120,
      reorderThreshold: 24,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Night Shift Coffee',
      category: 'drink',
      price: 4.50,
      description: 'Strong dark roast coffee to keep you going through the night. Available hot or iced.',
      photoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
      preparationTimeMin: 2,
      costOfGoods: 1.25,
      allergens: [],
      qtyOnHand: 200,
      reorderThreshold: 40,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Dawn Espresso',
      category: 'drink',
      price: 3.99,
      description: 'Double shot espresso for that morning kick as the night winds down.',
      photoUrl: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400',
      preparationTimeMin: 1,
      costOfGoods: 1.00,
      allergens: [],
      qtyOnHand: 150,
      reorderThreshold: 30,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Sleepy Time Tea',
      category: 'drink',
      price: 3.50,
      description: 'Herbal chamomile tea blend perfect for winding down. Caffeine-free.',
      photoUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
      preparationTimeMin: 3,
      costOfGoods: 0.75,
      allergens: [],
      qtyOnHand: 100,
      reorderThreshold: 20,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Moonlight Milkshake',
      category: 'drink',
      price: 7.99,
      description: 'Creamy vanilla milkshake topped with whipped cream. Choice of chocolate, strawberry, or vanilla.',
      photoUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
      preparationTimeMin: 4,
      costOfGoods: 2.25,
      allergens: ['dairy'],
      qtyOnHand: 45,
      reorderThreshold: 8,
      isActive: true,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    },
    
    {
      name: 'Fresh Orange Juice',
      category: 'drink',
      price: 4.99,
      description: 'Freshly squeezed orange juice, perfect for a vitamin C boost during late hours.',
      photoUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400',
      preparationTimeMin: 2,
      costOfGoods: 1.50,
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
      name: 'Special Wine Selection',
      category: 'drink',
      price: 18.99,
      description: 'Premium red wine selection, perfect pairing for our steak dishes.',
      photoUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400',
      preparationTimeMin: 1,
      costOfGoods: 8.50,
      allergens: [],
      qtyOnHand: 0,
      reorderThreshold: 6,
      isActive: false,
      promoPercent: null,
      promoStartDate: null,
      promoEndDate: null
    }
  ];
  
  await menuItemRepository.save(menuItems);
  console.log(`Created ${menuItems.length} menu items`);
}