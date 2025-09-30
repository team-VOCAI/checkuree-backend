import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ResponseUtil } from '../../utils/response.util';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { AttendeesService } from './attendees.service';

// '/book/:bookId/attendee' 경로로 들어오는 요청을 처리하는 컨트롤러입니다.
// Controller 클래스를 분리해두면 라우팅과 요청/응답 처리 로직을 한 곳에서 관리할 수 있습니다.
@Controller('book/:bookId/attendee')
@UsePipes(
  // 이 컨트롤러 전체에 ValidationPipe를 적용해서 DTO 기반 검증을 수행합니다.
  // whitelist: true -> DTO에 정의되지 않은 필드는 자동으로 제거되어 안전합니다.
  // transform: true -> 문자열로 들어온 숫자 등을 DTO 타입에 맞게 변환합니다.
  new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }),
)
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  // POST /book/:bookId/attendee/new 엔드포인트입니다.
  // ParseIntPipe가 URL 파라미터(:bookId)를 number 타입으로 변환해주고, 변환에 실패하면 400 에러를 반환합니다.
  @Post('new')
  async createAttendee(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() body: CreateAttendeeDto,
  ) {
    // 서비스에 실제 비즈니스 로직을 위임합니다. 컨트롤러는 요청을 검증하고 서비스 호출만 담당합니다.
    const attendee = await this.attendeesService.createAttendee(bookId, body);

    // 공통 포맷을 맞추기 위해 ResponseUtil.success()를 사용합니다.
    return ResponseUtil.success(attendee, 'Attendee created successfully');
  }
}