/**
 * Order Seeds
 * Creates comprehensive order data with different statuses and scenarios
 */

import { AppDataSource } from '../data-source';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { OrderStatus, PaymentStatus, PaymentMode } from '../models/enums';

export async function seedOrders() {
  const orderRepository = AppDataSource.getRepository(Order);
  const orderItemRepository = AppDataSource.getRepository(OrderItem);
  
  const currentTime = new Date();
  
  // Create various orders with different statuses
  const orders = [
    // Recent completed orders
    {
      customerId: 9, // Customer 1
      tableNumber: 5,
      status: OrderStatus.SERVED,
      subtotalAmount: 45.98,
      taxAmount: 4.14,
      serviceChargeAmount: 2.30,
      tipAmount: 8.00,
      totalAmount: 60.42,
      paymentMode: PaymentMode.CARD,
      paymentStatus: PaymentStatus.PAID,
      placedAt: new Date(currentTime.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      servedAt: new Date(currentTime.getTime() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      notes: 'Extra napkins requested'
    },
    
    {
      customerId: 10, // Customer 2
      tableNumber: 3,
      status: OrderStatus.CLOSED,
      subtotalAmount: 28.48,
      taxAmount: 2.56,
      serviceChargeAmount: 1.42,
      tipAmount: 5.00,
      totalAmount: 37.46,
      paymentMode: PaymentMode.CASH,
      paymentStatus: PaymentStatus.PAID,
      placedAt: new Date(currentTime.getTime() - 3 * 60 * 60 * 1000),
      servedAt: new Date(currentTime.getTime() - 2.5 * 60 * 60 * 1000),
      notes: null
    },
    
    // Currently active orders
    {
      customerId: 11, // Customer 3
      tableNumber: 7,
      status: OrderStatus.IN_KITCHEN,
      subtotalAmount: 52.96,
      taxAmount: 4.77,
      serviceChargeAmount: 2.65,
      tipAmount: 0,
      totalAmount: 60.38,
      paymentMode: PaymentMode.CARD,
      paymentStatus: PaymentStatus.PAID,
      placedAt: new Date(currentTime.getTime() - 20 * 60 * 1000), // 20 minutes ago
      servedAt: null,
      notes: 'No onions on burger'
    },
    
    {
      customerId: 9, // Customer 1 again
      tableNumber: 2,
      status: OrderStatus.READY,
      subtotalAmount: 31.98,
      taxAmount: 2.88,
      serviceChargeAmount: 1.60,
      tipAmount: 0,
      totalAmount: 36.46,
      paymentMode: PaymentMode.QR,
      paymentStatus: PaymentStatus.PAID,
      placedAt: new Date(currentTime.getTime() - 15 * 60 * 1000), // 15 minutes ago
      servedAt: null,
      notes: 'Customer waiting at table 2'
    },
    
    {
      customerId: 10, // Customer 2
      tableNumber: 1,
      status: OrderStatus.PLACED,
      subtotalAmount: 64.95,
      taxAmount: 5.85,
      serviceChargeAmount: 3.25,
      tipAmount: 0,
      totalAmount: 74.05,
      paymentMode: PaymentMode.CARD,
      paymentStatus: PaymentStatus.PAID,
      placedAt: new Date(currentTime.getTime() - 5 * 60 * 1000), // 5 minutes ago
      servedAt: null,
      notes: 'Large group order'
    },
    
    // Draft orders (cart items)
    {
      customerId: 11, // Customer 3
      tableNumber: 4,
      status: OrderStatus.DRAFT,
      subtotalAmount: 25.48,
      taxAmount: 0,
      serviceChargeAmount: 0,
      tipAmount: 0,
      totalAmount: 25.48,
      paymentMode: null,
      paymentStatus: PaymentStatus.PENDING,
      placedAt: null,
      servedAt: null,
      notes: 'Still deciding on drinks'
    },
    
    // Cancelled order
    {
      customerId: 9, // Customer 1
      tableNumber: 6,
      status: OrderStatus.CANCELLED,
      subtotalAmount: 19.99,
      taxAmount: 1.80,
      serviceChargeAmount: 1.00,
      tipAmount: 0,
      totalAmount: 22.79,
      paymentMode: PaymentMode.CARD,
      paymentStatus: PaymentStatus.FAILED,
      placedAt: new Date(currentTime.getTime() - 45 * 60 * 1000),
      servedAt: null,
      notes: 'Payment declined - card issue'
    }
  ];
  
  const savedOrders = await orderRepository.save(orders);
  console.log(`Created ${savedOrders.length} orders`);
  
  // Create order items for each order
  const orderItems = [
    // Order 1 items (Completed - Customer 1, Table 5)
    {
      orderId: 1,
      menuItemId: 1, // Midnight Burger
      nameSnapshot: 'Midnight Burger',
      quantity: 1,
      unitPrice: 18.99,
      percentOff: 0,
      lineTotal: 18.99,
      specialInstructions: null
    },
    {
      orderId: 1,
      menuItemId: 2, // Night Owl Wings  
      nameSnapshot: 'Night Owl Wings',
      quantity: 1,
      unitPrice: 14.03, // With 15% promo discount
      percentOff: 15,
      lineTotal: 14.03,
      specialInstructions: 'Extra hot sauce'
    },
    {
      orderId: 1,
      menuItemId: 17, // Night Shift Coffee
      nameSnapshot: 'Night Shift Coffee',
      quantity: 2,
      unitPrice: 4.50,
      percentOff: 0,
      lineTotal: 9.00,
      specialInstructions: null
    },
    {
      orderId: 1,
      menuItemId: 12, // Midnight Mojito (with 20% discount)
      nameSnapshot: 'Midnight Mojito',
      quantity: 1,
      unitPrice: 10.39,
      percentOff: 20,
      lineTotal: 10.39,
      specialInstructions: 'Light on mint'
    },
    
    // Order 2 items (Closed - Customer 2, Table 3)
    {
      orderId: 2,
      menuItemId: 7, // Night Crawler Quesadilla
      nameSnapshot: 'Night Crawler Quesadilla',
      quantity: 2,
      unitPrice: 13.99,
      percentOff: 0,
      lineTotal: 27.98,
      specialInstructions: 'Extra guacamole'
    },
    {
      orderId: 2,
      menuItemId: 19, // Sleepy Time Tea
      nameSnapshot: 'Sleepy Time Tea',
      quantity: 1,
      unitPrice: 3.50,
      percentOff: 0,
      lineTotal: 3.50,
      specialInstructions: null
    },
    
    // Order 3 items (In Kitchen - Customer 3, Table 7)
    {
      orderId: 3,
      menuItemId: 8, // Vampire Steak
      nameSnapshot: 'Vampire Steak',
      quantity: 1,
      unitPrice: 28.99,
      percentOff: 0,
      lineTotal: 28.99,
      specialInstructions: 'Medium rare'
    },
    {
      orderId: 3,
      menuItemId: 4, // After Hours Pizza
      nameSnapshot: 'After Hours Pizza',
      quantity: 1,
      unitPrice: 22.99,
      percentOff: 0,
      lineTotal: 22.99,
      specialInstructions: 'No mushrooms'
    },
    {
      orderId: 3,
      menuItemId: 15, // Starlight Beer
      nameSnapshot: 'Starlight Beer',
      quantity: 1,
      unitPrice: 6.99,
      percentOff: 0,
      lineTotal: 6.99,
      specialInstructions: null
    },
    
    // Order 4 items (Ready - Customer 1, Table 2)
    {
      orderId: 4,
      menuItemId: 10, // Owl Sandwich
      nameSnapshot: 'Owl Sandwich',
      quantity: 2,
      unitPrice: 15.50,
      percentOff: 0,
      lineTotal: 31.00,
      specialInstructions: 'No mayo on one'
    },
    {
      orderId: 4,
      menuItemId: 21, // Fresh Orange Juice
      nameSnapshot: 'Fresh Orange Juice',
      quantity: 1,
      unitPrice: 4.99,
      percentOff: 0,
      lineTotal: 4.99,
      specialInstructions: 'Extra pulp'
    },
    
    // Order 5 items (Just Placed - Customer 2, Table 1)
    {
      orderId: 5,
      menuItemId: 1, // Midnight Burger
      nameSnapshot: 'Midnight Burger',
      quantity: 2,
      unitPrice: 18.99,
      percentOff: 0,
      lineTotal: 37.98,
      specialInstructions: null
    },
    {
      orderId: 5,
      menuItemId: 3, // Loaded Nachos Supreme
      nameSnapshot: 'Loaded Nachos Supreme',
      quantity: 1,
      unitPrice: 14.99,
      percentOff: 0,
      lineTotal: 14.99,
      specialInstructions: 'Extra cheese'
    },
    {
      orderId: 5,
      menuItemId: 12, // Midnight Mojito (with discount)
      nameSnapshot: 'Midnight Mojito',
      quantity: 1,
      unitPrice: 10.39,
      percentOff: 20,
      lineTotal: 10.39,
      specialInstructions: null
    },
    {
      orderId: 5,
      menuItemId: 18, // Dawn Espresso
      nameSnapshot: 'Dawn Espresso',
      quantity: 1,
      unitPrice: 3.99,
      percentOff: 0,
      lineTotal: 3.99,
      specialInstructions: 'Double shot'
    },
    
    // Order 6 items (Draft - Customer 3, Table 4)
    {
      orderId: 6,
      menuItemId: 9, // Sleepwalker Salad
      nameSnapshot: 'Sleepwalker Salad',
      quantity: 1,
      unitPrice: 12.99,
      percentOff: 0,
      lineTotal: 12.99,
      specialInstructions: 'Dressing on side'
    },
    {
      orderId: 6,
      menuItemId: 20, // Moonlight Milkshake
      nameSnapshot: 'Moonlight Milkshake',
      quantity: 1,
      unitPrice: 7.99,
      percentOff: 0,
      lineTotal: 7.99,
      specialInstructions: 'Chocolate flavor'
    },
    {
      orderId: 6,
      menuItemId: 16, // Night Shift Coffee
      nameSnapshot: 'Night Shift Coffee',
      quantity: 1,
      unitPrice: 4.50,
      percentOff: 0,
      lineTotal: 4.50,
      specialInstructions: 'Iced'
    },
    
    // Order 7 items (Cancelled - Customer 1, Table 6)
    {
      orderId: 7,
      menuItemId: 6, // Moonlight Fish & Chips
      nameSnapshot: 'Moonlight Fish & Chips',
      quantity: 1,
      unitPrice: 17.99,
      percentOff: 0,
      lineTotal: 17.99,
      specialInstructions: null
    },
    {
      orderId: 7,
      menuItemId: 17, // Night Shift Coffee
      nameSnapshot: 'Night Shift Coffee',
      quantity: 1,
      unitPrice: 4.50,
      percentOff: 0,
      lineTotal: 4.50,
      specialInstructions: null
    }
  ];
  
  await orderItemRepository.save(orderItems);
  console.log(`Created ${orderItems.length} order items`);
}