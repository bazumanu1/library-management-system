import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';

vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const prisma = {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  };

  const jwt = {
    signAsync: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(prisma as any, jwt as any);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
    jwt.signAsync.mockResolvedValue('test-jwt-token');
  });

  it('should register a user and hash the password', async () => {
    const dto = {
      name: 'Test User',
      email: 'TEST@example.com',
      password: 'Password123!',
    };

    prisma.user.create.mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'PATRON',
      createdAt: new Date(),
    });

    const result = await service.register(dto as any);

    expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 12);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'test@example.com',
          password: 'hashed-password',
        }),
      }),
    );
    expect(result.access_token).toBe('test-jwt-token');
  });

  it('should log in with valid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
      role: 'PATRON',
    });

    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await service.login({
      email: 'TEST@example.com',
      password: 'Password123!',
    } as any);

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'Password123!',
      'hashed-password',
    );
    expect(result.access_token).toBe('test-jwt-token');
  });

  it('should reject an unknown email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'unknown@example.com',
        password: 'Password123!',
      } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject an incorrect password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
      role: 'PATRON',
    });

    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'WrongPassword!',
      } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should generate a JWT with the user ID and email', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 5,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
      role: 'PATRON',
    });

    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    await service.login({
      email: 'test@example.com',
      password: 'Password123!',
    } as any);

    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: 5,
      email: 'test@example.com',
    });
  });
});
