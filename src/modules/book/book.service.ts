import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ValidationUtil } from '../../utils/validation.util';
import { Express } from 'express';
import * as fs from 'fs/promises';
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

    const uniqueDays = Array.from(new Set(dto.availableDays ?? []));
    const title = ValidationUtil.sanitizeString(dto.title);

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
    // Prisma 모델명: BOOKS -> 클라이언트 접근자: bOOKS
    return this.prisma.bOOKS.findMany({
      orderBy: { bookId: 'desc' },
      include: {
        user: { select: { userId: true, username: true, name: true } },
        ATTENDEES: true,
        FILES: true,
      },
    });
  }

  async findOne(bookId: number) {
    const book = await this.prisma.bOOKS.findUnique({
      where: { bookId },
      include: {
        user: { select: { userId: true, username: true, name: true } },
        ATTENDEES: true,
        FILES: true,
      },
    });
    if (!book) throw new NotFoundException(`Book ${bookId} not found`);
    return book;
  }

  async update(bookId: number, dto: UpdateBookDto) {
    // 기존 레코드 조회(시간 유효성 비교용, 404 처리)
    const existing = await this.prisma.bOOKS.findUnique({ where: { bookId } });
    if (!existing) throw new NotFoundException(`Book ${bookId} not found`);

    // 시간 유효성: 제공된 값과 기존 값을 조합하여 from < to 확인
    const fromStr = dto.availableFrom ?? (existing as any).availableFrom;
    const toStr = dto.availableTo ?? (existing as any).availableTo;
    if (fromStr && toStr) {
      const fromMin = hhmmToMinutes(fromStr);
      const toMin = hhmmToMinutes(toStr);
      if (Number.isNaN(fromMin) || Number.isNaN(toMin) || fromMin >= toMin) {
        throw new BadRequestException('availableFrom must be earlier than availableTo');
      }
    }

    // 데이터 정규화/세팅
    const data: any = {};
    if (dto.title !== undefined) data.title = ValidationUtil.sanitizeString(dto.title);
    if (dto.description !== undefined) data.description = ValidationUtil.sanitizeString(dto.description);
    if (dto.availableFrom !== undefined) data.availableFrom = dto.availableFrom.padStart(4, '0');
    if (dto.availableTo !== undefined) data.availableTo = dto.availableTo.padStart(4, '0');
    if (dto.availableDays !== undefined) data.availableDays = Array.from(new Set(dto.availableDays));

    try {
      return await this.prisma.bOOKS.update({
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
      const exists = await tx.bOOKS.findUnique({ where: { bookId } });
      if (!exists) throw new NotFoundException(`Book ${bookId} not found`);

      // 1) 해당 책의 참석자 찾기
      const attendeeIds = (
        await tx.aTTENDEES.findMany({
          where: { bookId },
          select: { attendeeId: true },
        })
      ).map((a) => a.attendeeId);

      // 2) 참석자 하위 의존 삭제
      if (attendeeIds.length > 0) {
        await tx.cURRICULUMS.deleteMany({ where: { attendeeId: { in: attendeeIds } } });
        await tx.rECORDS.deleteMany({ where: { attendeeId: { in: attendeeIds } } });
        await tx.cOUNSELLING.deleteMany({ where: { attendeeId: { in: attendeeIds } } });
        await tx.rEPORTS.deleteMany({ where: { attendeeId: { in: attendeeIds } } });
        await tx.aTTENDEES.deleteMany({ where: { attendeeId: { in: attendeeIds } } });
      }

      // 3) 파일 삭제
      await tx.fILES.deleteMany({ where: { bookId } });

      // 4) 책 삭제
      await tx.bOOKS.delete({ where: { bookId } });
    });
  }

  async uploadFile(bookId: number, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('file is required');

    // 책 존재 확인
    const book = await this.prisma.bOOKS.findUnique({ where: { bookId } });
    if (!book) {
      // 업로드된 파일 정리
      try { await fs.unlink(file.path); } catch {}
      throw new NotFoundException(`Book ${bookId} not found`);
    }

    // FILES 스키마에 맞게 필드명 조정하세요.
    try {
      const saved = await this.prisma.fILES.create({
        data: {
          bookId: bookId,
          originalName: file.originalname,   // ← 스키마에 맞게 변경
          filename: file.filename,           // ← 스키마에 맞게 변경
          mimeType: file.mimetype,           // ← 스키마에 맞게 변경
          size: file.size,                   // ← 스키마에 맞게 변경
          path: file.path,                   // ← 스키마에 맞게 변경
        } as any,
      });
      return {
        id: (saved as any).fileId ?? undefined,
        bookId,
        originalName: file.originalname,
        filename: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/books/${file.filename}`, // 정적 서빙 구성 시 사용
      };
    } catch (e) {
      // DB 저장 실패 시 파일 삭제(롤백)
      try { await fs.unlink(file.path); } catch {}
      throw e;
    }
  }
}