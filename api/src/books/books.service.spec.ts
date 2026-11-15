import { describe, expect, it, vi } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BooksService } from './books.service.js';

describe('BooksService', () => {
  it('returns pagination metadata', async () => {
    const prisma = {
      $transaction: async ([findMany, count]: any[]) => [{ id: 1, title: 'Dune' }, 1],
      book: { findMany: vi.fn(), count: vi.fn() },
    } as any;

    const service = new BooksService(prisma);
    const result = await service.findAll({ page: 1, limit: 10, search: 'dune' });

    expect(result.meta.total).toBe(1);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
  });

  it('throws when a book is missing', async () => {
    const prisma = {
      book: { findUnique: async () => null },
    } as any;

    const service = new BooksService(prisma);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws conflict for duplicate ISBN during create', async () => {
    const prisma = {
      book: {
        create: async () => {
          const err = new Error('duplicate');
          (err as any).code = 'P2002';
          throw err;
        },
      },
    } as any;

    const service = new BooksService(prisma);
    await expect(
      service.create({ title: 'Dune', author: 'Frank Herbert', isbn: '9780441172719', totalCopies: 3, genreId: 1 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
