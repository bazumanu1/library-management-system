import { describe, expect, it } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { GenresService } from './genres.service.js';

const prisma = {
  genre: {
    create: async (input: any) => ({ id: 1, ...input.data }),
    findUnique: async ({ where }: any) => (where.id === 1 ? { id: 1, name: 'Fantasy' } : null),
    update: async ({ data }: any) => ({ id: 1, name: data.name ?? 'Fantasy' }),
    delete: async () => ({ id: 1, name: 'Fantasy' }),
  },
  book: {
    count: async () => 1,
    findMany: async () => [{ id: 1, title: 'Test book' }],
  },
} as any;

describe('GenresService', () => {
  it('creates a genre', async () => {
    const service = new GenresService(prisma);
    const result = await service.create({ name: 'Fantasy' });
    expect(result.name).toBe('Fantasy');
  });

  it('throws when a genre does not exist', async () => {
    const service = new GenresService({
      ...prisma,
      genre: { ...prisma.genre, findUnique: async () => null },
    } as any);
    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when deleting a referenced genre', async () => {
    const service = new GenresService({
      ...prisma,
      genre: {
        ...prisma.genre,
        delete: async () => {
          const err = new Error('referenced');
          (err as any).code = 'P2003';
          throw err;
        },
      },
    } as any);

    await expect(service.remove(1)).rejects.toBeInstanceOf(ConflictException);
  });
});
