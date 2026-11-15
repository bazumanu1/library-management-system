import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GenresService } from './genres.service.js';

describe('GenresService', () => {
  let service: GenresService;

  const prisma = {
    genre: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GenresService(prisma as any);
  });

  it('should create a genre', async () => {
    const dto = { name: 'Science Fiction' };
    prisma.genre.create.mockResolvedValue({ id: 1, ...dto });

    await expect(service.create(dto as any))
      .resolves.toMatchObject(dto);
  });

  it('should list all genres', async () => {
    prisma.genre.findMany.mockResolvedValue([
      { id: 1, name: 'Fiction' },
    ]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(prisma.genre.findMany).toHaveBeenCalled();
  });

  it('should find a genre by ID', async () => {
    prisma.genre.findUnique.mockResolvedValue({
      id: 1,
      name: 'Fiction',
    });

    await expect(service.findOne(1))
      .resolves.toMatchObject({ id: 1 });
  });

  it('should throw NotFoundException for a missing genre', async () => {
    prisma.genre.findUnique.mockResolvedValue(null);

    await expect(service.findOne(99))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('should update a genre', async () => {
    prisma.genre.findUnique.mockResolvedValue({
      id: 1,
      name: 'Fiction',
    });

    prisma.genre.update.mockResolvedValue({
      id: 1,
      name: 'Fantasy',
    });

    await expect(
      service.update(1, { name: 'Fantasy' } as any),
    ).resolves.toMatchObject({ name: 'Fantasy' });
  });

  it('should delete a genre', async () => {
    prisma.genre.findUnique.mockResolvedValue({
      id: 1,
      name: 'Fiction',
    });

    prisma.genre.delete.mockResolvedValue({ id: 1 });

    await expect(service.remove(1))
      .resolves.toMatchObject({ id: 1 });
  });

  it('should throw ConflictException when deleting a referenced genre', async () => {
    prisma.genre.findUnique.mockResolvedValue({
      id: 1,
      name: 'Fantasy',
    });

    const error = new Prisma.PrismaClientKnownRequestError(
      'Foreign key constraint failed',
      {
        code: 'P2003',
        clientVersion: '6.19.3',
      },
    );

    prisma.genre.delete.mockRejectedValue(error);

    await expect(service.remove(1))
      .rejects.toBeInstanceOf(ConflictException);
  });
});
