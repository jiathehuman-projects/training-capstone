import { AppDataSource } from '../../data-source';
import { User } from '../../models/User';
import { createTestUser } from '../testUtils';

describe('User Entity', () => {
  it('should create a new user', async () => {
    const user = await createTestUser();
    expect(user.id).toBeDefined();
    expect(user.username).toBe('testuser');
  });

  it('should enforce unique username', async () => {
    await createTestUser();
    await expect(createTestUser()).rejects.toThrow();
  });

  it('should enforce unique email', async () => {
    await createTestUser();
    await expect(
      createTestUser({ username: 'different', email: 'test@example.com' })
    ).rejects.toThrow();
  });

  it('should allow null phone number', async () => {
    const user = await createTestUser({ phone: null });
    expect(user.phone).toBeNull();
  });

  it('should store roles as array', async () => {
    const user = await createTestUser({ roles: ['customer', 'staff'] });
    expect(Array.isArray(user.roles)).toBe(true);
    expect(user.roles).toContain('customer');
    expect(user.roles).toContain('staff');
  });
});