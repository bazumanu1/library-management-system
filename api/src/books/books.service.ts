import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeIsbn(value: string): string {
    return value.trim().replace(/[\s-]+/g, '');
  }

  private parsePositiveInt(value: number | undefined, fallback: number, max = Number.MAX_SAFE_INTEGER): number {
    if (value === undefined || Number.isNaN(value) || !Number.isInteger(value) || value < 1) {
      return fallback;
    }
    return Math.min(value, max);
  }

  async create(dto: CreateBookDto) {
    try {
      return await this.prisma.book.create({
        data: {
          ...dto,
          isbn: this.normalizeIsbn(dto.isbn),
        },
        include: { genre: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A book with this ISBN already exists');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Genre not found');
        }
      }
      throw error;
    }
  }

  async findAll(query: { genreId?: number; search?: string; page?: number; limit?: number }) {
    const page = this.parsePositiveInt(query.page, 1, 1000);
    const limit = this.parsePositiveInt(query.limit, 10, 50);
    const genreId = query.genreId !== undefined && Number.isInteger(query.genreId) && query.genreId > 0 ? query.genreId : undefined;
    const search = query.search?.trim();

    if (query.genreId !== undefined && query.genreId !== null && (!Number.isInteger(query.genreId) || query.genreId <= 0)) {
      throw new BadRequestException('genreId must be a positive integer');
    }

    if (query.page !== undefined && query.page !== null && (!Number.isInteger(query.page) || query.page <= 0)) {
      throw new BadRequestException('page must be a positive integer');
    }

    if (query.limit !== undefined && query.limit !== null && (!Number.isInteger(query.limit) || query.limit <= 0)) {
      throw new BadRequestException('limit must be a positive integer');
    }

    const where: Prisma.BookWhereInput = {
      ...(genreId ? { genreId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { author: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { title: 'asc' },
        include: { genre: true },
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { genre: true, reviews: true },
    });

    if (!book) {
      throw new NotFoundException(`Book ${id} not found`);
    }

    return book;
  }

  async update(id: number, dto: UpdateBookDto) {
    await this.findOne(id);

    try {
      return await this.prisma.book.update({
        where: { id },
        data: {
          ...dto,
          ...(dto.isbn ? { isbn: this.normalizeIsbn(dto.isbn) } : {}),
        },
        include: { genre: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A book with this ISBN already exists');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Genre not found');
        }
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.book.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ConflictException('Cannot delete a book that has reviews attached');
      }
      throw error;
    }
  }
}
