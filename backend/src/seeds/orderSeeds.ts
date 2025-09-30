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
      menuItemId: 1, // Har Gow (Shrimp Dumplings)
      nameSnapshot: 'Har Gow (Shrimp Dumplings)',
      quantity: 2,
      unitPrice: 8.99,
      percentOff: 0,
      lineTotal: 17.98,
      specialInstructions: null
    },
    {
      orderId: 1,
      menuItemId: 2, // Siu Mai (Pork Dumplings) - with 15% promo discount
      nameSnapshot: 'Siu Mai (Pork Dumplings)',
      quantity: 2,
      unitPrice: 6.79, // With 15% promo discount
      percentOff: 15,
      lineTotal: 13.58,
      specialInstructions: 'Extra fish roe on top'
    },
    {
      orderId: 1,
      menuItemId: 12, // Jasmine Tea (with 20% discount)
      nameSnapshot: 'Jasmine Tea',
      quantity: 1,
      unitPrice: 3.99,
      percentOff: 20,
      lineTotal: 3.99,
      specialInstructions: 'Hot temperature'
    },
    {
      orderId: 1,
      menuItemId: 10, // Egg Tart (Dan Tat)
      nameSnapshot: 'Egg Tart (Dan Tat)',
      quantity: 2,
      unitPrice: 5.99,
      percentOff: 0,
      lineTotal: 11.98,
      specialInstructions: 'Warm please'
    },
    
    // Order 2 items (Closed - Customer 2, Table 3)
    {
      orderId: 2,
      menuItemId: 3, // Char Siu Bao (BBQ Pork Buns)
      nameSnapshot: 'Char Siu Bao (BBQ Pork Buns)',
      quantity: 3,
      unitPrice: 9.99,
      percentOff: 0,
      lineTotal: 29.97,
      specialInstructions: 'Extra sauce'
    },
    {
      orderId: 2,
      menuItemId: 14, // Oolong Tea
      nameSnapshot: 'Oolong Tea',
      quantity: 1,
      unitPrice: 5.99,
      percentOff: 0,
      lineTotal: 5.99,
      specialInstructions: null
    },
    
    // Order 3 items (In Kitchen - Customer 3, Table 7)
    {
      orderId: 3,
      menuItemId: 4, // Xiaolongbao (Soup Dumplings)
      nameSnapshot: 'Xiaolongbao (Soup Dumplings)',
      quantity: 2,
      unitPrice: 12.99,
      percentOff: 0,
      lineTotal: 25.98,
      specialInstructions: 'Be careful - hot soup inside'
    },
    {
      orderId: 3,
      menuItemId: 6, // Lo Mai Gai (Sticky Rice Chicken)
      nameSnapshot: 'Lo Mai Gai (Sticky Rice Chicken)',
      quantity: 1,
      unitPrice: 11.99,
      percentOff: 0,
      lineTotal: 11.99,
      specialInstructions: 'Extra mushrooms'
    },
    {
      orderId: 3,
      menuItemId: 15, // Hong Kong Milk Tea
      nameSnapshot: 'Hong Kong Milk Tea',
      quantity: 2,
      unitPrice: 6.50,
      percentOff: 0,
      lineTotal: 13.00,
      specialInstructions: 'Less sweet'
    },
    
    // Order 4 items (Ready - Customer 1, Table 2)
    {
      orderId: 4,
      menuItemId: 5, // Cheong Fun (Rice Rolls)
      nameSnapshot: 'Cheong Fun (Rice Rolls)',
      quantity: 2,
      unitPrice: 10.99,
      percentOff: 0,
      lineTotal: 21.98,
      specialInstructions: 'Shrimp filling'
    },
    {
      orderId: 4,
      menuItemId: 16, // Lychee Sparkling Water
      nameSnapshot: 'Lychee Sparkling Water',
      quantity: 2,
      unitPrice: 5.99,
      percentOff: 0,
      lineTotal: 11.98,
      specialInstructions: 'Extra ice'
    },
    
    // Order 5 items (Just Placed - Customer 2, Table 1)
    {
      orderId: 5,
      menuItemId: 1, // Har Gow (Shrimp Dumplings)
      nameSnapshot: 'Har Gow (Shrimp Dumplings)',
      quantity: 3,
      unitPrice: 8.99,
      percentOff: 0,
      lineTotal: 26.97,
      specialInstructions: null
    },
    {
      orderId: 5,
      menuItemId: 7, // Wu Gok (Taro Dumplings)
      nameSnapshot: 'Wu Gok (Taro Dumplings)',
      quantity: 2,
      unitPrice: 8.50,
      percentOff: 0,
      lineTotal: 17.00,
      specialInstructions: 'Extra crispy'  
    },
    {
      orderId: 5,
      menuItemId: 13, // Pu-erh Tea
      nameSnapshot: 'Pu-erh Tea',
      quantity: 1,
      unitPrice: 6.99,
      percentOff: 0,
      lineTotal: 6.99,
      specialInstructions: 'Strong brew'
    },
    {
      orderId: 5,
      menuItemId: 10, // Egg Tart (Dan Tat)
      nameSnapshot: 'Egg Tart (Dan Tat)',
      quantity: 4,
      unitPrice: 5.99,
      percentOff: 0,
      lineTotal: 23.96,
      specialInstructions: 'Assorted for sharing'
    },
    
    // Order 6 items (Draft - Customer 3, Table 4)
    {
      orderId: 6,
      menuItemId: 8, // Phoenix Claws (Chicken Feet)
      nameSnapshot: 'Phoenix Claws (Chicken Feet)',
      quantity: 1,
      unitPrice: 7.50,
      percentOff: 0,
      lineTotal: 7.50,
      specialInstructions: 'Mild spice level'
    },
    {
      orderId: 6,
      menuItemId: 9, // Turnip Cake (Lo Bak Go)
      nameSnapshot: 'Turnip Cake (Lo Bak Go)',
      quantity: 2,
      unitPrice: 6.99,
      percentOff: 0,
      lineTotal: 13.98,
      specialInstructions: 'Well done'
    },
    {
      orderId: 6,
      menuItemId: 17, // Winter Melon Tea
      nameSnapshot: 'Winter Melon Tea',
      quantity: 1,
      unitPrice: 4.99,
      percentOff: 0,
      lineTotal: 4.99,
      specialInstructions: 'Cold temperature'
    },
    
    // Order 7 items (Cancelled - Customer 1, Table 6)
    {
      orderId: 7,
      menuItemId: 4, // Xiaolongbao (Soup Dumplings)
      nameSnapshot: 'Xiaolongbao (Soup Dumplings)',
      quantity: 1,
      unitPrice: 12.99,
      percentOff: 0,
      lineTotal: 12.99,
      specialInstructions: null
    },
    {
      orderId: 7,
      menuItemId: 18, // Fresh Soy Milk
      nameSnapshot: 'Fresh Soy Milk',
      quantity: 2,
      unitPrice: 3.99,
      percentOff: 0,
      lineTotal: 7.98,
      specialInstructions: 'Hot temperature'
    }
  ];
  
  await orderItemRepository.save(orderItems);
  console.log(`Created ${orderItems.length} order items`);
}