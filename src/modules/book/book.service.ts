import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ValidationUtil } from '../../utils/validation.util';
import type { Express } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

function hhmmToMinutes(hhmm: string): number {
  const s = (hhmm ?? '').padStart(4, '0');
  const hh = parseInt(s.slice(0, 2), 10);
  const mm = parseInt(s.slice(2, 4), 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return NaN;
  return hh * 60 + mm;
}

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookDto, userId: number) {
    if (!userId) throw new BadRequestException('userId is required');

    const toMinutes = (v: string) => {
      const hh = parseInt(v?.slice(0, 2) ?? '', 10);
      const mm = parseInt(v?.slice(2, 4) ?? '', 10);
      if (Number.isNaN(hh) || Number.isNaN(mm)) return NaN;
      return hh * 60 + mm;
    };
    if (Number.isNaN(toMinutes(dto.availableFrom)) || Number.isNaN(toMinutes(dto.availableTo)) || toMinutes(dto.availableFrom) >= toMinutes(dto.availableTo)) {
      throw new BadRequestException('availableFrom must be earlier than availableTo');
    }

    const data: any = {
      title: ValidationUtil.sanitizeString(dto.title),
      description: (dto as any).description ? ValidationUtil.sanitizeString((dto as any).description) : null,
      availableFrom: dto.availableFrom.padStart(4, '0'),
      availableTo: dto.availableTo.padStart(4, '0'),
      availableDays: Array.from(new Set(dto.availableDays ?? [])),
      user: { connect: { userId } }, // 스키마 관계명에 맞게 조정
    };

    return this.prisma.books.create({ data });
  }

  // 생성은 이미 userId 연결로 구현됨

  async findAll(userId: number) {
    return this.prisma.books.findMany({
      where: { userId },
      orderBy: { bookId: 'desc' },
    });
  }

  async findOne(bookId: number, userId: number) {
    const book = await this.prisma.books.findFirst({ where: { bookId, userId } });
    if (!book) throw new NotFoundException(`Book ${bookId} not found`);
    return book;
  }

  async update(bookId: number, dto: UpdateBookDto, userId: number) {
    const existing = await this.prisma.books.findFirst({ where: { bookId, userId } });
    if (!existing) throw new NotFoundException(`Book ${bookId} not found`);

    const fromStr = dto.availableFrom ?? (existing as any).availableFrom;
    const toStr = dto.availableTo ?? (existing as any).availableTo;
    if (fromStr && toStr) {
      const fromMin = hhmmToMinutes(fromStr);
      const toMin = hhmmToMinutes(toStr);
      if (Number.isNaN(fromMin) || Number.isNaN(toMin) || fromMin >= toMin) {
        throw new BadRequestException('availableFrom must be earlier than availableTo');
      }
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = ValidationUtil.sanitizeString(dto.title);
    if (dto.description !== undefined) data.description = ValidationUtil.sanitizeString(dto.description);
    if (dto.availableFrom !== undefined) data.availableFrom = dto.availableFrom.padStart(4, '0');
    if (dto.availableTo !== undefined) data.availableTo = dto.availableTo.padStart(4, '0');
    if (dto.availableDays !== undefined) data.availableDays = Array.from(new Set(dto.availableDays));

    return this.prisma.books.update({ where: { bookId }, data });
  }

  async remove(bookId: number, userId: number) {
    await this.prisma.$transaction(async (tx) => {
      const exists = await tx.books.findFirst({ where: { bookId, userId } });
      if (!exists) throw new NotFoundException(`Book ${bookId} not found`);

      const attendeeIds = (
        await tx.attendees.findMany({
          where: { bookId },
          select: { attendeeId: true },
        })
      ).map((a) => a.attendeeId);

      if (attendeeIds.length > 0) {
        await tx.curriculums.deleteMany({ where: { attendeeId: { in: attendeeIds } } });
        await tx.records.deleteMany({ where: { attendeeId: { in: attendeeIds } } });
        await tx.attendees.deleteMany({ where: { attendeeId: { in: attendeeIds } } });
      }

      try {
        await tx.files.deleteMany({ where: { bookId } });
      } catch {}

      await tx.books.delete({ where: { bookId } });
    });
  }

  async uploadFile(bookId: number, file: Express.Multer.File, userId: number) {
    if (!file) throw new BadRequestException('file is required');

    const book = await this.prisma.books.findFirst({ where: { bookId, userId } });
    if (!book) throw new NotFoundException(`Book ${bookId} not found`);

    const saved = await this.prisma.files.create({
      data: {
        bookId,
        originalName: file.originalname,
        filename: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
      } as any,
    });

    return {
      id: (saved as any).fileId ?? undefined,
      bookId,
      originalName: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/books/${file.filename}`,
    };
  }
}