import { decimalTransformer } from '../../models/transformers';

describe('Decimal Transformer', () => {
  describe('to() method - converting to database value', () => {
    it('should convert null to "0"', () => {
      expect(decimalTransformer.to(null)).toBe('0');
    });

    it('should convert undefined to "0"', () => {
      expect(decimalTransformer.to(undefined)).toBe('0');
    });

    it('should convert NaN to "0"', () => {
      expect(decimalTransformer.to(NaN)).toBe('0');
    });

    it('should convert valid numbers to fixed decimal strings', () => {
      expect(decimalTransformer.to(10)).toBe('10.00');
      expect(decimalTransformer.to(10.5)).toBe('10.50');
      expect(decimalTransformer.to(10.555)).toBe('10.56'); // rounded
      expect(decimalTransformer.to(0)).toBe('0.00');
    });

    it('should handle negative numbers', () => {
      expect(decimalTransformer.to(-10.75)).toBe('-10.75');
      expect(decimalTransformer.to(-0.01)).toBe('-0.01');
    });

    it('should handle very large numbers', () => {
      expect(decimalTransformer.to(999999.99)).toBe('999999.99');
      expect(decimalTransformer.to(1000000)).toBe('1000000.00');
    });

    it('should handle very small numbers', () => {
      expect(decimalTransformer.to(0.001)).toBe('0.00'); // rounded down
      expect(decimalTransformer.to(0.005)).toBe('0.01'); // rounded up
    });
  });

  describe('from() method - converting from database value', () => {
    it('should convert null to 0', () => {
      expect(decimalTransformer.from(null)).toBe(0);
    });

    it('should convert undefined to 0', () => {
      expect(decimalTransformer.from(undefined)).toBe(0);
    });

    it('should convert empty string to 0', () => {
      expect(decimalTransformer.from('')).toBe(0);
    });

    it('should convert valid number strings to numbers', () => {
      expect(decimalTransformer.from('10.00')).toBe(10);
      expect(decimalTransformer.from('10.50')).toBe(10.5);
      expect(decimalTransformer.from('0.00')).toBe(0);
      expect(decimalTransformer.from('999.99')).toBe(999.99);
    });

    it('should handle negative number strings', () => {
      expect(decimalTransformer.from('-10.75')).toBe(-10.75);
      expect(decimalTransformer.from('-0.01')).toBe(-0.01);
    });

    it('should convert invalid strings to 0', () => {
      expect(decimalTransformer.from('abc')).toBe(0);
      expect(decimalTransformer.from('10.5.5')).toBe(0); // Invalid number format
      expect(decimalTransformer.from('NaN')).toBe(0);
      expect(decimalTransformer.from('Infinity')).toBe(0);
    });

    it('should handle scientific notation', () => {
      expect(decimalTransformer.from('1e2')).toBe(100);
      expect(decimalTransformer.from('1.5e1')).toBe(15);
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain precision through round-trip conversion', () => {
      const testValues = [0, 1, 10.50, 999.99, -5.25];
      
      testValues.forEach(value => {
        const toDb = decimalTransformer.to(value);
        const fromDb = decimalTransformer.from(toDb);
        expect(fromDb).toBe(value);
      });
    });

    it('should handle null/undefined through round-trip', () => {
      const nullToDb = decimalTransformer.to(null);
      const nullFromDb = decimalTransformer.from(nullToDb);
      expect(nullFromDb).toBe(0);

      const undefinedToDb = decimalTransformer.to(undefined);
      const undefinedFromDb = decimalTransformer.from(undefinedToDb);
      expect(undefinedFromDb).toBe(0);
    });
  });
});