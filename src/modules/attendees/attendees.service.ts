import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AttendeeAssociateDto, CreateAttendeeDto } from './dto/create-attendee.dto';

// 실제 데이터베이스 작업과 비즈니스 규칙을 처리하는 서비스 클래스입니다.
// NestJS에서는 컨트롤러가 요청을 받고, 서비스가 실질적인 로직을 담당하는 패턴이 일반적입니다.
@Injectable()
export class AttendeesService {
  constructor(private readonly prisma: PrismaService) {}

  // 학생 등록 로직을 수행하는 메서드입니다.
  async createAttendee(
    bookId: number,
    dto: CreateAttendeeDto,
  ) {
    // 1. 해당 출석부(book)가 존재하는지 확인합니다.
    const book = await this.prisma.bOOKS.findUnique({
      where: { bookId },
    });

    if (!book) {
      // NestJS의 NotFoundException을 던지면 자동으로 404 상태 코드가 반환됩니다.
      throw new NotFoundException(`Book with id ${bookId} not found`);
    }

    // 2. 초기/현재 학년이 실제로 존재하는지 확인합니다.
    await this.ensureGradeExists(dto.initialGradeId, 'initial');
    await this.ensureGradeExists(dto.gradeId, 'current');

    // 3. Prisma 스키마의 associates 필드는 문자열 배열이므로 JSON 문자열로 변환합니다.
    const associates = dto.associates?.map((associate) =>
      JSON.stringify(associate),
    );

    // 4. Prisma Client를 이용해 ATTENDEES 레코드를 생성합니다.
    const attendee = await this.prisma.aTTENDEES.create({
      data: {
        bookId,
        name: dto.name,
        actualName: dto.actualName,
        gender: dto.gender.toUpperCase(),
        birthDate: new Date(dto.birthDate),
        enrollmentDate: new Date(dto.enrollmentDate),
        school: dto.school,
        isBeginner: dto.isBeginner,
        address_1: dto.address_1,
        initialGradeId: dto.initialGradeId,
        gradeId: dto.gradeId,
        associates: associates ?? [],
        description: null,
        status: 'ACTIVE',
        schedules: [],
        progress: [],
      },
      include: {
        // 응답에서 연관된 출석부와 학년 정보를 함께 확인할 수 있도록 include 옵션을 사용합니다.
        book: true,
        initialGrade: true,
        grade: true,
      },
    });

    return attendee;
  }

  async getAttendee(bookId: number, attendeeId: number) {
    const attendee = await this.prisma.aTTENDEES.findFirst({
      where: { attendeeId, bookId },
      include: {
        book: true,
        initialGrade: true,
        grade: true,
      },
    });

    if (!attendee) {
      throw new NotFoundException(
        `Attendee with id ${attendeeId} not found in book ${bookId}`,
      );
    }

    const associates = attendee.associates
      .map((associate) => {
        try {
          return JSON.parse(associate) as AttendeeAssociateDto;
        } catch {
          return null;
        }
      })
      .filter((associate): associate is AttendeeAssociateDto => associate !== null);

    return {
      ...attendee,
      associates,
    };
  }

  // GRADES 테이블에 학년이 존재하는지 확인하는 보조 메서드입니다.
  private async ensureGradeExists(
    gradeId: number,
    label: 'initial' | 'current',
  ): Promise<void> {
    const grade = await this.prisma.gRADES.findUnique({
      where: { gradeId },
    });

    if (!grade) {
      throw new NotFoundException(
        `Grade (${label}) with id ${gradeId} not found`,
      );
    }
  }
}