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

  validateAndEcho(dto: CreateBookDto) {
    const fromMin = hhmmToMinutes(dto.availableFrom);
    const toMin = hhmmToMinutes(dto.availableTo);
    if (Number.isNaN(fromMin) || Number.isNaN(toMin) || fromMin >= toMin) {
      throw new BadRequestException('availableFrom must be earlier than availableTo');
    }
    const title = ValidationUtil.sanitizeString(dto.title);
    const uniqueDays = Array.from(new Set(dto.availableDays ?? []));
    const courses = (dto.courses ?? []).map((c) => ({
      title: ValidationUtil.sanitizeString(c.title),
      isPrimary: c.isPrimary,
      grades: (c as any).grades
        ? (c as any).grades.map((g: any) => ({ subjectItemId: g.subjectItemId, level: g.level }))
        : [],
    }));
    return {
      title,
      availableFrom: dto.availableFrom.padStart(4, '0'),
      availableTo: dto.availableTo.padStart(4, '0'),
      availableDays: uniqueDays,
      courses,
    };
  }

  async findAll() {
    // NOTE: 필요 시 include/select 추가
    return this.prisma.books.findMany({
      orderBy: { bookId: 'desc' },
    });
  }

  async findOne(bookId: number) {
    const book = await this.prisma.books.findUnique({
      where: { bookId },
    });
    if (!book) throw new NotFoundException(`Book ${bookId} not found`);
    return book;
  }

  async update(bookId: number, dto: UpdateBookDto) {
    const existing = await this.prisma.books.findUnique({ where: { bookId } });
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

    try {
      return await this.prisma.books.update({
        where: { bookId },
        data,
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException(`Book ${bookId} not found`);
      }
      throw e;
    }
  }

  async remove(bookId: number) {
    await this.prisma.$transaction(async (tx) => {
      const exists = await tx.books.findUnique({ where: { bookId } });
      if (!exists) throw new NotFoundException(`Book ${bookId} not found`);

      // 참석자 ID 수집
      const attendeeIds = (
        await tx.attendees.findMany({
          where: { bookId },
          select: { attendeeId: true },
        })
      ).map((a) => a.attendeeId);

      // 하위 의존 삭제(스키마에 존재하는 모델만)
      if (attendeeIds.length > 0) {
        await tx.curriculums.deleteMany({ where: { attendeeId: { in: attendeeIds } } });
        await tx.records.deleteMany({ where: { attendeeId: { in: attendeeIds } } });
        await tx.attendees.deleteMany({ where: { attendeeId: { in: attendeeIds } } });
      }

      // 파일이 bookId를 참조한다면
      try {
        await tx.files.deleteMany({ where: { bookId } });
      } catch {
        // files 모델/컬럼이 없으면 무시
      }

      await tx.books.delete({ where: { bookId } });
    });
  }

  async uploadFile(bookId: number, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('file is required');

    const book = await this.prisma.books.findUnique({ where: { bookId } });
    if (!book) throw new NotFoundException(`Book ${bookId} not found`);

    try {
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
    } catch (e) {
      throw e;
    }
  }
}