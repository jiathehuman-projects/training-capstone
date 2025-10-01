import { validateOrderItem } from '../../controllers/order';
import { MenuItem } from '../../models/MenuItem';

describe('Order Item Validation', () => {
  let mockMenuItem: MenuItem;

  beforeEach(() => {
    mockMenuItem = {
      id: 1,
      name: 'Test Item',
      price: 10.50,
      qtyOnHand: 5,
      isActive: true,
      category: 'main',
      description: 'Test description',
      preparationTimeMin: 15
    } as MenuItem;
  });

  describe('validateOrderItem', () => {
    it('should validate a valid order item', () => {
      const orderItem = {
        menuItemId: 1,
        quantity: 2
      };

      const result = validateOrderItem(orderItem, mockMenuItem);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid quantity types', () => {
      const testCases = [
        { quantity: null, expected: 'must be a positive integer' },
        { quantity: undefined, expected: 'must be a positive integer' },
        { quantity: 'invalid', expected: 'must be a positive integer' },
        { quantity: 1.5, expected: 'must be a positive integer' },
        { quantity: 0, expected: 'must be a positive integer' },
        { quantity: -1, expected: 'must be a positive integer' }
      ];

      testCases.forEach(({ quantity, expected }) => {
        const orderItem = { menuItemId: 1, quantity };
        const result = validateOrderItem(orderItem, mockMenuItem);

        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain(expected);
      });
    });

    it('should reject items that are not available', () => {
      mockMenuItem.qtyOnHand = 0;
      const orderItem = { menuItemId: 1, quantity: 1 };

      const result = validateOrderItem(orderItem, mockMenuItem);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Item Test Item is not available');
    });

    it('should reject quantities exceeding available stock', () => {
      mockMenuItem.qtyOnHand = 3;
      const orderItem = { menuItemId: 1, quantity: 5 };

      const result = validateOrderItem(orderItem, mockMenuItem);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Insufficient stock for Test Item. Available: 3, Requested: 5');
    });

    it('should reject inactive menu items', () => {
      mockMenuItem.isActive = false;
      const orderItem = { menuItemId: 1, quantity: 2 };

      const result = validateOrderItem(orderItem, mockMenuItem);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Item Test Item is no longer available');
    });

    it('should reject items with invalid prices', () => {
      const testCases = [
        { price: null, expected: 'Invalid price' },
        { price: undefined, expected: 'Invalid price' },
        { price: NaN, expected: 'Invalid price' },
        { price: -1, expected: 'Invalid price' },
        { price: 'invalid', expected: 'Invalid price' }
      ];

      testCases.forEach(({ price, expected }) => {
        mockMenuItem.price = price as any;
        const orderItem = { menuItemId: 1, quantity: 2 };
        const result = validateOrderItem(orderItem, mockMenuItem);

        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain(expected);
      });
    });

    it('should handle multiple validation errors', () => {
      mockMenuItem.isActive = false;
      mockMenuItem.qtyOnHand = 0;
      mockMenuItem.price = -1;
      
      const orderItem = { menuItemId: 1, quantity: 0 };

      const result = validateOrderItem(orderItem, mockMenuItem);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors.some(error => error.includes('must be a positive integer'))).toBe(true);
      expect(result.errors.some(error => error.includes('not available'))).toBe(true);
      expect(result.errors.some(error => error.includes('no longer available'))).toBe(true);
      expect(result.errors.some(error => error.includes('Invalid price'))).toBe(true);
    });

    it('should handle edge case quantities', () => {
      mockMenuItem.qtyOnHand = 1;
      
      // Test exact stock match
      const validItem = { menuItemId: 1, quantity: 1 };
      const validResult = validateOrderItem(validItem, mockMenuItem);
      expect(validResult.isValid).toBe(true);

      // Test one over stock
      const invalidItem = { menuItemId: 1, quantity: 2 };
      const invalidResult = validateOrderItem(invalidItem, mockMenuItem);
      expect(invalidResult.isValid).toBe(false);
    });

    it('should handle zero price items', () => {
      mockMenuItem.price = 0;
      const orderItem = { menuItemId: 1, quantity: 2 };

      const result = validateOrderItem(orderItem, mockMenuItem);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});