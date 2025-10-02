import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { MenuItem, Order, OrderItem } from '../../shared/models';
import { AppDataSource } from '../../shared/data-source';
import { OrderStatus, PaymentStatus } from '../../shared/models/enums';
import { MoreThan, LessThan } from 'typeorm';

const menuItemRepository = AppDataSource.getRepository(MenuItem);
const orderRepository = AppDataSource.getRepository(Order);
const orderItemRepository = AppDataSource.getRepository(OrderItem);

interface AuthenticatedRequest extends Request {
  currentUser?: string | JwtPayload;
}

interface CreateOrderRequest extends AuthenticatedRequest {
  body: {
    items: Array<{
      menuItemId: number;
      quantity: number;
      customizations?: string;
    }>;
    tableNumber: number;
  };
}

interface ConfirmOrderRequest extends AuthenticatedRequest {
  body: {
    confirmed: boolean;
  };
}

interface UpdateOrderStatusRequest extends AuthenticatedRequest {
  body: {
    status: OrderStatus;
  };
}

interface JwtPayloadWithId extends JwtPayload {
  id: number;
  roles: string[];
}

// Helper function to get user ID from JWT
const getUserIdFromToken = (currentUser: string | JwtPayload): number => {
  if (typeof currentUser === 'object' && 'id' in currentUser) {
    return (currentUser as JwtPayloadWithId).id;
  }
  throw new Error('Invalid token format');
};

// Helper function to check if user has staff role
const isStaffUser = (currentUser: string | JwtPayload): boolean => {
  if (typeof currentUser === 'object' && 'roles' in currentUser) {
    const payload = currentUser as JwtPayloadWithId;
    return payload.roles.some(role => ['staff', 'manager', 'admin'].includes(role));
  }
  return false;
};

// Helper function to calculate order totals
export const calculateOrderTotals = (orderItems: OrderItem[]): { subtotal: number; tax: number; total: number } => {
  // Handle empty array case
  if (!orderItems || orderItems.length === 0) {
    return { subtotal: 0, tax: 0, total: 0 };
  }

  // Calculate subtotal with proper null/undefined checks
  const subtotal = orderItems.reduce((sum, item) => {
    // Validate item properties
    const unitPrice = typeof item.unitPrice === 'number' && !isNaN(item.unitPrice) ? item.unitPrice : 0;
    const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0;
    
    return sum + (unitPrice * quantity);
  }, 0);

  // Ensure subtotal is a valid number
  const validSubtotal = typeof subtotal === 'number' && !isNaN(subtotal) ? subtotal : 0;
  
  // Calculate tax (8% tax rate)
  const tax = validSubtotal * 0.08;
  const validTax = typeof tax === 'number' && !isNaN(tax) ? tax : 0;
  
  // Calculate total
  const total = validSubtotal + validTax;
  const validTotal = typeof total === 'number' && !isNaN(total) ? total : 0;
  
  return { 
    subtotal: Number(validSubtotal.toFixed(2)), 
    tax: Number(validTax.toFixed(2)), 
    total: Number(validTotal.toFixed(2)) 
  };
};

// Helper function to validate order item data
export const validateOrderItem = (item: any, menuItem: MenuItem): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate quantity
  if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
    errors.push(`Invalid quantity for item ${menuItem.name}: must be a positive integer`);
  }

  // Validate menu item availability
  if (menuItem.qtyOnHand <= 0) {
    errors.push(`Item ${menuItem.name} is not available`);
  }

  // Validate quantity against available stock
  if (item.quantity > menuItem.qtyOnHand) {
    errors.push(`Insufficient stock for ${menuItem.name}. Available: ${menuItem.qtyOnHand}, Requested: ${item.quantity}`);
  }

  // Validate menu item is active
  if (!menuItem.isActive) {
    errors.push(`Item ${menuItem.name} is no longer available`);
  }

  // Validate price is valid
  if (typeof menuItem.price !== 'number' || isNaN(menuItem.price) || menuItem.price < 0) {
    errors.push(`Invalid price for item ${menuItem.name}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to clean up expired draft orders
const cleanupExpiredDrafts = async (): Promise<void> => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  await orderRepository.delete({
    status: OrderStatus.DRAFT,
    createdAt: LessThan(thirtyMinutesAgo)
  });
};

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { category, available, search } = req.query;
    
    let queryBuilder = menuItemRepository.createQueryBuilder('menuItem')
      .where('menuItem.isActive = :isActive', { isActive: true });

    if (category) {
      queryBuilder = queryBuilder.andWhere('menuItem.category = :category', { category });
    }

    if (available === 'true') {
      queryBuilder = queryBuilder.andWhere('menuItem.qtyOnHand > 0');
    }

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(menuItem.name ILIKE :search OR menuItem.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const menuItems = await queryBuilder
      .orderBy('menuItem.category', 'ASC')
      .addOrderBy('menuItem.name', 'ASC')
      .getMany();

    // Apply promotional pricing
    const menuItemsWithPromo = menuItems.map((item: MenuItem) => {
      const now = new Date();
      const hasActivePromo = item.promoPercent && 
        item.promoStartsAt && 
        item.promoEndsAt &&
        now >= item.promoStartsAt && 
        now <= item.promoEndsAt;

      const displayPrice = hasActivePromo 
        ? item.price * (1 - item.promoPercent! / 100)
        : item.price;

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        displayPrice: Number(displayPrice.toFixed(2)),
        description: item.description,
        photoUrl: item.photoUrl,
        preparationTimeMin: item.preparationTimeMin,
        isAvailable: item.qtyOnHand > 0,
        hasPromo: hasActivePromo,
        promoPercent: hasActivePromo ? item.promoPercent : null
      };
    });

    return res.status(200).json({
      message: 'Menu items retrieved successfully',
      menuItems: menuItemsWithPromo
    });

  } catch (err) {
    const error = err as Error;
    console.error('Get menu items error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve menu items',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const createOrder = async (req: CreateOrderRequest, res: Response) => {
  try {
    console.log('🚀 Starting order creation...');
    
    // Clean up expired drafts periodically
    await cleanupExpiredDrafts();

    const userId = getUserIdFromToken(req.currentUser!);
    const { items, tableNumber } = req.body;
    
    console.log('📋 Order request data:', { userId, items: items?.length, tableNumber });

    // Validate that we have items to order
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Order must contain at least one item'
      });
    }

    // Validate menu items exist and are available
    const menuItemIds = items.map(item => item.menuItemId);
    const menuItems = await menuItemRepository.findByIds(menuItemIds);

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({
        error: 'One or more menu items not found'
      });
    }

    // Validate each order item using the validation function
    const validationErrors: string[] = [];
    const validatedItems: Array<{ item: any; menuItem: MenuItem }> = [];

    for (const requestedItem of items) {
      const menuItem = menuItems.find((mi: MenuItem) => mi.id === requestedItem.menuItemId);
      if (!menuItem) {
        validationErrors.push(`Menu item with ID ${requestedItem.menuItemId} not found`);
        continue;
      }

      const validation = validateOrderItem(requestedItem, menuItem);
      if (!validation.isValid) {
        validationErrors.push(...validation.errors);
      } else {
        validatedItems.push({ item: requestedItem, menuItem });
      }
    }

    // Return all validation errors at once
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Order validation failed',
        details: validationErrors
      });
    }

    // Create order
    const order = new Order();
    order.customerId = userId;
    order.tableNumber = tableNumber;
    order.status = OrderStatus.DRAFT;
    order.paymentStatus = PaymentStatus.PENDING;
    
    // Initialize monetary fields to ensure proper transformer handling
    order.subtotalAmount = 0;
    order.taxAmount = 0;
    order.serviceChargeAmount = 0;
    order.tipAmount = 0;
    order.totalAmount = 0;
    
    // Save order first to get the ID
    const savedOrder = await orderRepository.save(order);
    console.log('✅ Order created with ID:', savedOrder.id);

    // Validate that the order was saved properly
    if (!savedOrder.id) {
      throw new Error('Failed to create order - no ID generated');
    }

    // Create order items using validated data
    const orderItems: OrderItem[] = [];
    for (const { item: requestedItem, menuItem } of validatedItems) {
      const orderItem = new OrderItem();
      
      // Set both the relation and the explicit ID
      orderItem.orderId = savedOrder.id;  // Explicitly set the orderId
      orderItem.order = savedOrder;       // Set the relation
      orderItem.menuItemId = menuItem.id;
      orderItem.quantity = requestedItem.quantity;
      orderItem.unitPrice = menuItem.price;
      orderItem.nameSnapshot = menuItem.name;
      orderItem.percentOff = 0;
      
      // Calculate line total with validation
      const lineTotal = menuItem.price * requestedItem.quantity;
      orderItem.lineTotal = typeof lineTotal === 'number' && !isNaN(lineTotal) ? lineTotal : 0;
      
      // Validate order item before adding
      if (!orderItem.orderId || !orderItem.menuItemId || !orderItem.quantity || orderItem.quantity <= 0) {
        throw new Error(`Invalid order item data: orderId=${orderItem.orderId}, menuItemId=${orderItem.menuItemId}, quantity=${orderItem.quantity}`);
      }
      
      orderItems.push(orderItem);
    }

    console.log('📦 Saving order items:', orderItems.length, 'items');
    const savedOrderItems = await orderItemRepository.save(orderItems);
    console.log('✅ Order items saved successfully');

    // Calculate totals
    const { subtotal, tax, total } = calculateOrderTotals(savedOrderItems);
    
    // Validate calculated totals before saving
    const validatedSubtotal = typeof subtotal === 'number' && !isNaN(subtotal) ? subtotal : 0;
    const validatedTax = typeof tax === 'number' && !isNaN(tax) ? tax : 0;
    const validatedTotal = typeof total === 'number' && !isNaN(total) ? total : 0;
    
    // Update order with validated totals
    savedOrder.subtotalAmount = validatedSubtotal;
    savedOrder.taxAmount = validatedTax;
    savedOrder.totalAmount = validatedTotal;
    
    // Update status to PLACED since the order is now complete
    savedOrder.status = OrderStatus.PLACED;
    savedOrder.placedAt = new Date();
    
    // Log for debugging if values were corrected
    if (subtotal !== validatedSubtotal || tax !== validatedTax || total !== validatedTotal) {
      console.warn('Order totals validation corrected invalid values:', {
        original: { subtotal, tax, total },
        corrected: { subtotal: validatedSubtotal, tax: validatedTax, total: validatedTotal },
        orderId: savedOrder.id
      });
    }
    
    await orderRepository.save(savedOrder);

    // Calculate estimated preparation time
    const maxPrepTime = menuItems.reduce((max: number, item: MenuItem) => {
      return Math.max(max, item.preparationTimeMin || 15);
    }, 15);

    return res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: savedOrder.id,
        customerId: savedOrder.customerId,
        tableNumber: savedOrder.tableNumber,
        status: savedOrder.status,
        subtotalAmount: savedOrder.subtotalAmount,
        taxAmount: savedOrder.taxAmount,
        serviceChargeAmount: savedOrder.serviceChargeAmount,
        tipAmount: savedOrder.tipAmount,
        totalAmount: savedOrder.totalAmount,
        paymentMode: savedOrder.paymentMode,
        paymentStatus: savedOrder.paymentStatus,
        placedAt: savedOrder.placedAt,
        confirmedAt: savedOrder.closedAt, // Using closedAt as confirmedAt equivalent
        estimatedPrepTime: maxPrepTime,
        items: savedOrderItems.map((item: OrderItem) => ({
          id: item.id,
          orderId: item.orderId,
          menuItemId: item.menuItemId,
          nameSnapshot: item.nameSnapshot,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          percentOff: item.percentOff,
          lineTotal: item.lineTotal
        }))
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Create order error:', error);
    return res.status(500).json({
      error: 'Failed to create order',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const getOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserIdFromToken(req.currentUser!);
    const orderId = parseInt(req.params.orderId);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const order = await orderRepository.findOne({
      where: { id: orderId },
      relations: ['items']
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    // Check if user owns this order (customers can only see their own orders)
    if (!isStaffUser(req.currentUser!) && order.customerId !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    return res.status(200).json({
      message: 'Order retrieved successfully',
      order: {
        id: order.id,
        customerId: order.customerId,
        tableNumber: order.tableNumber,
        status: order.status,
        subtotal: order.subtotalAmount,
        tax: order.taxAmount,
        total: order.totalAmount,
        paymentMode: order.paymentMode,
        paymentStatus: order.paymentStatus,
        placedAt: order.placedAt,
        closedAt: order.closedAt,
        items: order.items.map((item: OrderItem) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          menuItemName: item.nameSnapshot,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal
        }))
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Get order error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve order',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const confirmOrder = async (req: ConfirmOrderRequest, res: Response) => {
  try {
    const userId = getUserIdFromToken(req.currentUser!);
    const orderId = parseInt(req.params.orderId);
    const { confirmed } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    if (!confirmed) {
      return res.status(400).json({
        error: 'Order confirmation required'
      });
    }

    const order = await orderRepository.findOne({
      where: { id: orderId },
      relations: ['items']
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.customerId !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Check if order is in draft status
    if (order.status !== OrderStatus.DRAFT) {
      return res.status(400).json({
        error: 'Order cannot be confirmed - not in draft status'
      });
    }

    // Re-validate menu items availability before confirming
    const menuItemIds = order.items.map((item: OrderItem) => item.menuItemId);
    const menuItems = await menuItemRepository.findByIds(menuItemIds);

    for (const orderItem of order.items) {
      const menuItem = menuItems.find((mi: MenuItem) => mi.id === orderItem.menuItemId);
      if (!menuItem?.isActive || menuItem.qtyOnHand < orderItem.quantity) {
        return res.status(400).json({
          error: `Menu item "${orderItem.nameSnapshot}" is no longer available in requested quantity`
        });
      }
    }

    // Update order status and timestamp
    order.status = OrderStatus.PLACED;
    order.placedAt = new Date();

    const savedOrder = await orderRepository.save(order);

    return res.status(200).json({
      message: 'Order confirmed successfully',
      order: {
        id: savedOrder.id,
        status: savedOrder.status,
        tableNumber: savedOrder.tableNumber,
        subtotal: savedOrder.subtotalAmount,
        tax: savedOrder.taxAmount,
        total: savedOrder.totalAmount,
        placedAt: savedOrder.placedAt,
        estimatedReadyTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Confirm order error:', error);
    return res.status(500).json({
      error: 'Failed to confirm order',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const getOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserIdFromToken(req.currentUser!);
    const orderId = parseInt(req.params.orderId);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const order = await orderRepository.findOne({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    // Check if user owns this order (customers can only see their own orders)
    if (!isStaffUser(req.currentUser!) && order.customerId !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Calculate estimated completion time based on status
    let estimatedReadyTime = null;
    if (order.status === OrderStatus.PLACED && order.placedAt) {
      estimatedReadyTime = new Date(order.placedAt.getTime() + 30 * 60 * 1000);
    } else if (order.status === OrderStatus.IN_KITCHEN && order.placedAt) {
      estimatedReadyTime = new Date(order.placedAt.getTime() + 20 * 60 * 1000);
    }

    return res.status(200).json({
      message: 'Order status retrieved successfully',
      status: {
        orderId: order.id,
        status: order.status,
        placedAt: order.placedAt,
        closedAt: order.closedAt,
        estimatedReadyTime
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Get order status error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve order status',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const getCustomerOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserIdFromToken(req.currentUser!);
    const requestedCustomerId = parseInt(req.params.customerId);
    const { limit = 10, offset = 0 } = req.query;

    if (isNaN(requestedCustomerId)) {
      return res.status(400).json({
        error: 'Invalid customer ID'
      });
    }

    // Check if user can access these orders (customers can only see their own)
    if (!isStaffUser(req.currentUser!) && requestedCustomerId !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    const orders = await orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'orderItems')
      .where('order.customerId = :customerId', { customerId: requestedCustomerId })
      .orderBy('order.createdAt', 'DESC')
      .take(Number(limit))
      .skip(Number(offset))
      .getMany();

    const orderHistory = orders.map((order: Order) => ({
      id: order.id,
      customerId: order.customerId,
      tableNumber: order.tableNumber,
      status: order.status,
      subtotalAmount: order.subtotalAmount,
      taxAmount: order.taxAmount,
      serviceChargeAmount: order.serviceChargeAmount,
      tipAmount: order.tipAmount,
      totalAmount: order.totalAmount,
      paymentMode: order.paymentMode,
      paymentStatus: order.paymentStatus,
      placedAt: order.placedAt,
      confirmedAt: order.closedAt, // Using closedAt as confirmedAt equivalent
      items: order.items.map((item: OrderItem) => ({
        id: item.id,
        orderId: item.orderId,
        menuItemId: item.menuItemId,
        nameSnapshot: item.nameSnapshot,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        percentOff: item.percentOff,
        lineTotal: item.lineTotal
      }))
    }));

    return res.status(200).json({
      message: 'Customer orders retrieved successfully',
      orders: orderHistory,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: orders.length
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Get customer orders error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve customer orders',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const updateOrderStatus = async (req: UpdateOrderStatusRequest, res: Response) => {
  try {
    // Check if user has staff privileges
    if (!isStaffUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied - staff privileges required'
      });
    }

    const orderId = parseInt(req.params.orderId);
    const { status } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const order = await orderRepository.findOne({
      where: { id: orderId },
      relations: ['items']
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    // Validate status transition
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.DRAFT]: [],
      [OrderStatus.PLACED]: [OrderStatus.IN_KITCHEN, OrderStatus.CANCELLED],
      [OrderStatus.IN_KITCHEN]: [OrderStatus.READY],
      [OrderStatus.READY]: [OrderStatus.SERVED],
      [OrderStatus.SERVED]: [OrderStatus.CLOSED],
      [OrderStatus.CLOSED]: [],
      [OrderStatus.CANCELLED]: []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        error: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    // Handle inventory decrement when moving to IN_KITCHEN
    if (status === OrderStatus.IN_KITCHEN && order.status === OrderStatus.PLACED) {
      for (const orderItem of order.items) {
        await menuItemRepository.decrement(
          { id: orderItem.menuItemId },
          'qtyOnHand',
          orderItem.quantity
        );
      }
    }

    // Update order status
    order.status = status;
    
    // Set closed timestamp if order is completed
    if (status === OrderStatus.CLOSED) {
      order.closedAt = new Date();
    }

    const savedOrder = await orderRepository.save(order);

    return res.status(200).json({
      message: 'Order status updated successfully',
      order: {
        id: savedOrder.id,
        status: savedOrder.status,
        updatedAt: savedOrder.updatedAt,
        closedAt: savedOrder.closedAt
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Update order status error:', error);
    return res.status(500).json({
      error: 'Failed to update order status',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const getAllOrdersForStaff = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user has staff privileges
    if (!isStaffUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied - staff privileges required'
      });
    }

    const { limit = 50, offset = 0 } = req.query;

    // Get all orders excluding DRAFT, CLOSED, and CANCELLED
    const orders = await orderRepository.find({
      where: [
        { status: OrderStatus.PLACED },
        { status: OrderStatus.IN_KITCHEN },
        { status: OrderStatus.READY },
        { status: OrderStatus.SERVED }
      ],
      relations: ['items'],
      order: { placedAt: 'ASC' }, // FIFO - oldest first
      take: Number(limit),
      skip: Number(offset)
    });

    const staffOrders = orders.map((order: Order) => ({
      id: order.id,
      customerId: order.customerId,
      tableNumber: order.tableNumber,
      status: order.status,
      subtotalAmount: order.subtotalAmount,
      taxAmount: order.taxAmount,
      serviceChargeAmount: order.serviceChargeAmount,
      tipAmount: order.tipAmount,
      totalAmount: order.totalAmount,
      paymentMode: order.paymentMode,
      paymentStatus: order.paymentStatus,
      placedAt: order.placedAt,
      closedAt: order.closedAt,
      items: order.items.map((item: OrderItem) => ({
        id: item.id,
        orderId: item.orderId,
        menuItemId: item.menuItemId,
        nameSnapshot: item.nameSnapshot,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        percentOff: item.percentOff,
        lineTotal: item.lineTotal
      }))
    }));

    return res.status(200).json({
      message: 'Staff orders retrieved successfully',
      orders: staffOrders,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: orders.length
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Get staff orders error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve staff orders',
      message: error.message || 'An unknown error occurred'
    });
  }
};