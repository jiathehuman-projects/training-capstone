import { User } from '../models/User';
import { AppDataSource } from '../data-source';
import { encrypt_password } from '../utils/helper';
import { MenuItem } from '../models/MenuItem';
import { Order } from '../models/Order';
import { OrderStatus, PaymentMode, PaymentStatus } from '../models/enums';

export const createTestUser = async (overrides: Partial<User> = {}) => {
  const userRepository = AppDataSource.getRepository(User);
  
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: await encrypt_password('Password123'),
    firstName: 'Test',
    lastName: 'User',
    roles: ['customer'],
    phone: null,
    profileUrl: null,
    staffStatus: null,
    workerRoles: null,
    weeklyAvailability: null
  };

  const user = userRepository.create({
    ...defaultUser,
    ...overrides
  });

  return await userRepository.save(user);
};

export const createTestMenuItem = async (overrides: Partial<MenuItem> = {}) => {
  const menuItemRepository = AppDataSource.getRepository(MenuItem);
  
  const defaultMenuItem = {
    name: 'Test Item',
    category: 'Test Category',
    price: 9.99,
    description: 'Test description',
    photoUrl: null,
    preparationTimeMin: 15,
    costOfGoods: 5.00,
    allergens: [],
    qtyOnHand: 100,
    reorderThreshold: 10,
    reorderStatus: false,
    isActive: true
  };

  const menuItem = menuItemRepository.create({
    ...defaultMenuItem,
    ...overrides
  });

  return await menuItemRepository.save(menuItem);
};

export const createTestOrder = async (overrides: Partial<Order> = {}) => {
  const orderRepository = AppDataSource.getRepository(Order);
  
  const defaultOrder = {
    customerId: 1,
    tableNumber: 1,
    status: OrderStatus.DRAFT,
    subtotalAmount: 0,
    taxAmount: 0,
    serviceChargeAmount: 0,
    tipAmount: 0,
    totalAmount: 0,
    paymentMode: PaymentMode.CASH,
    paymentStatus: PaymentStatus.PENDING,
    placedAt: new Date(),
    customerNameSnapshot: 'Test Customer'
  };

  const order = orderRepository.create({
    ...defaultOrder,
    ...overrides
  });

  return await orderRepository.save(order);
};