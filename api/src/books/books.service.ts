import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookDto) {
    try {
      return await this.prisma.book.create({ data: dto, include: { genre: true } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new ConflictException('A book with this ISBN already exists');
        if (error.code === 'P2003') throw new NotFoundException('Genre not found');
      }
      throw error;
    }
  }

  async findAll(query: { genreId?: number; search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const where: Prisma.BookWhereInput = {
      ...(query.genreId ? { genreId: query.genreId } : {}),
      ...(query.search?.trim() ? {
        OR: [
          { title: { contains: query.search.trim(), mode: 'insensitive' } },
          { author: { contains: query.search.trim(), mode: 'insensitive' } },
        ],
      } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { title: 'asc' }, include: { genre: true },
      }),
      this.prisma.book.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({ where: { id }, include: { genre: true, reviews: true } });
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }

  async update(id: number, dto: UpdateBookDto) {
    await this.findOne(id);
    try {
      return await this.prisma.book.update({ where: { id }, data: dto, include: { genre: true } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new ConflictException('A book with this ISBN already exists');
        if (error.code === 'P2003') throw new NotFoundException('Genre not found');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.book.delete({ where: { id } });
  }
}
