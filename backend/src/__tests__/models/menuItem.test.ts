import { createTestMenuItem } from '../testUtils';

describe('MenuItem Entity', () => {
  it('should create a new menu item', async () => {
    const menuItem = await createTestMenuItem();
    expect(menuItem.id).toBeDefined();
    expect(menuItem.name).toBe('Test Item');
  });

  it('should store price as decimal', async () => {
    const menuItem = await createTestMenuItem({ price: 10.99 });
    expect(typeof menuItem.price).toBe('number');
    expect(menuItem.price).toBe(10.99);
  });

  it('should store allergens as array', async () => {
    const menuItem = await createTestMenuItem({
      allergens: ['nuts', 'dairy']
    });
    expect(Array.isArray(menuItem.allergens)).toBe(true);
    expect(menuItem.allergens).toContain('nuts');
    expect(menuItem.allergens).toContain('dairy');
  });

  it('should handle null values', async () => {
    const menuItem = await createTestMenuItem({
      description: null,
      photoUrl: null,
      promoPercent: null
    });
    expect(menuItem.description).toBeNull();
    expect(menuItem.photoUrl).toBeNull();
    expect(menuItem.promoPercent).toBeNull();
  });
});