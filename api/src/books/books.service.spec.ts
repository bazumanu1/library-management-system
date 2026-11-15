import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    const dto = {
      title: 'Test Book',
      author: 'Test Author',
      isbn: '9780441172719',
      totalCopies: 3,
      genreId: 1,
    };

    prisma.book.create.mockResolvedValue({ id: 1, ...dto });

    await expect(service.create(dto as any))
      .resolves.toMatchObject(dto);
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

  it('should return pagination metadata when searching', async () => {
    prisma.$transaction.mockResolvedValue([
      [{ id: 1, title: 'Dune' }],
      1,
    ]);

    const result = await service.findAll({
      page: 1,
      limit: 10,
      search: 'dune',
    });

    expect(result.meta.total).toBe(1);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
    expect(result.data).toHaveLength(1);
  });

  it('should find a book by ID', async () => {
    prisma.book.findUnique.mockResolvedValue({
      id: 1,
      title: 'Test Book',
    });

    await expect(service.findOne(1))
      .resolves.toMatchObject({ id: 1 });
  });

  it('should throw NotFoundException when book does not exist', async () => {
    prisma.book.findUnique.mockResolvedValue(null);

    await expect(service.findOne(99))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('should update an existing book', async () => {
    prisma.book.findUnique.mockResolvedValue({
      id: 1,
      title: 'Old Title',
    });

    prisma.book.update.mockResolvedValue({
      id: 1,
      title: 'New Title',
    });

    await expect(
      service.update(1, { title: 'New Title' } as any),
    ).resolves.toMatchObject({ title: 'New Title' });
  });

  it('should delete an existing book', async () => {
    prisma.book.findUnique.mockResolvedValue({ id: 1 });
    prisma.book.delete.mockResolvedValue({ id: 1 });

    await expect(service.remove(1))
      .resolves.toMatchObject({ id: 1 });
  });

  it('should throw ConflictException for duplicate ISBN', async () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: '6.19.3',
      },
    );

    prisma.book.create.mockRejectedValue(error);

    await expect(
      service.create({
        title: 'Dune',
        author: 'Frank Herbert',
        isbn: '9780441172719',
        totalCopies: 3,
        genreId: 1,
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
