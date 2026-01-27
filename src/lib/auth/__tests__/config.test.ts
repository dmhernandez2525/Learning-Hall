import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the payload client
vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}));

import { validateCredentials, createUser, getUserById } from '../config';
import { getPayloadClient } from '@/lib/payload';

const mockPayload = {
  login: vi.fn(),
  create: vi.fn(),
  findByID: vi.fn(),
  update: vi.fn(),
};

describe('Auth Config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getPayloadClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockPayload);
  });

  describe('validateCredentials', () => {
    it('returns user on successful login', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockPayload.login.mockResolvedValue({ user: mockUser });

      const result = await validateCredentials('test@example.com', 'password123');

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        tenant: undefined,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });
    });

    it('returns null on failed login', async () => {
      mockPayload.login.mockResolvedValue({ user: null });

      const result = await validateCredentials('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('returns null on error', async () => {
      mockPayload.login.mockRejectedValue(new Error('Login failed'));

      const result = await validateCredentials('test@example.com', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('creates user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'new@example.com',
        name: 'New User',
        role: 'student',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockPayload.create.mockResolvedValue(mockUser);

      const result = await createUser({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(result).toEqual({
        id: '1',
        email: 'new@example.com',
        name: 'New User',
        role: 'student',
        tenant: undefined,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'users',
        data: {
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
          role: 'student',
        },
      });
    });

    it('returns null on error', async () => {
      mockPayload.create.mockRejectedValue(new Error('User exists'));

      const result = await createUser({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      });

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('returns user when found', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockPayload.findByID.mockResolvedValue(mockUser);

      const result = await getUserById('1');

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        tenant: undefined,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });
    });

    it('returns null when user not found', async () => {
      mockPayload.findByID.mockResolvedValue(null);

      const result = await getUserById('999');

      expect(result).toBeNull();
    });

    it('returns null on error', async () => {
      mockPayload.findByID.mockRejectedValue(new Error('Not found'));

      const result = await getUserById('1');

      expect(result).toBeNull();
    });
  });
});
