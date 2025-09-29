import { createTestOrder } from '../testUtils';
import { OrderStatus, PaymentStatus, PaymentMode } from '../../models/enums';

describe('Order Entity', () => {
  it('should create a new order', async () => {
    const order = await createTestOrder();
    expect(order.id).toBeDefined();
    expect(order.status).toBe(OrderStatus.DRAFT);
  });

  it('should calculate totals correctly', async () => {
    const order = await createTestOrder({
      subtotalAmount: 100,
      taxAmount: 10,
      serviceChargeAmount: 5,
      tipAmount: 15
    });
    expect(order.totalAmount).toBe(130);
  });

  it('should handle enum values', async () => {
    const order = await createTestOrder({
      status: OrderStatus.SERVED,
      paymentMode: PaymentMode.CARD,
      paymentStatus: PaymentStatus.PAID
    });
    expect(order.status).toBe('served');
    expect(order.paymentMode).toBe('card');
    expect(order.paymentStatus).toBe('paid');
  });

  it('should track timestamps', async () => {
    const order = await createTestOrder();
    expect(order.createdAt).toBeInstanceOf(Date);
    expect(order.updatedAt).toBeInstanceOf(Date);
  });
});