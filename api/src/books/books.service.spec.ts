import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BooksService } from './books.service.js';

describe('BooksService', () => {
  let service: BooksService;

  const prisma = {
    book: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BooksService(prisma as any);
  });

  it('should create a book', async () => {
    const dto = { title: 'Test Book', author: 'Test Author' };
    prisma.book.create.mockResolvedValue({ id: 1, ...dto });

    await expect(service.create(dto as any)).resolves.toMatchObject(dto);
  });

  it('should list books with pagination', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.meta).toEqual({
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
  });

  it('should find a book by ID', async () => {
    prisma.book.findUnique.mockResolvedValue({ id: 1, title: 'Test Book' });

    await expect(service.findOne(1)).resolves.toMatchObject({ id: 1 });
  });

  it('should throw NotFoundException when book does not exist', async () => {
    prisma.book.findUnique.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('should update an existing book', async () => {
    const book = { id: 1, title: 'Old Title' };
    prisma.book.findUnique.mockResolvedValue(book);
    prisma.book.update.mockResolvedValue({ id: 1, title: 'New Title' });

    await expect(
      service.update(1, { title: 'New Title' } as any),
    ).resolves.toMatchObject({ title: 'New Title' });
  });

  it('should delete an existing book', async () => {
    prisma.book.findUnique.mockResolvedValue({ id: 1 });
    prisma.book.delete.mockResolvedValue({ id: 1 });

    await expect(service.remove(1)).resolves.toMatchObject({ id: 1 });
  });
});
