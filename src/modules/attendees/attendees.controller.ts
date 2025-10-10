import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ResponseUtil } from '../../utils/response.util';
import { AttendeesService } from './attendees.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { UpdateAttendeeStatusDto } from './dto/update-attendee-status.dto';

@Controller('book/:bookId/attendee')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }),
)
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Get()
  async listAttendees(@Param('bookId', ParseIntPipe) bookId: number) {
    const attendees = await this.attendeesService.listAttendees(bookId);

    return ResponseUtil.success(
      attendees,
      'Attendees retrieved successfully',
    );
  }

  @Post('new')
  async createAttendee(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() body: CreateAttendeeDto,
  ) {
    const attendee = await this.attendeesService.createAttendee(bookId, body);

    return ResponseUtil.success(attendee, 'Attendee created successfully');
  }

  @Get(':attendeeId')
  async getAttendee(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('attendeeId', ParseIntPipe) attendeeId: number,
  ) {
    const attendee = await this.attendeesService.getAttendee(
      bookId,
      attendeeId,
    );

    return ResponseUtil.success(attendee, 'Attendee retrieved successfully');
  }

  @Patch(':attendeeId')
  async updateAttendee(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('attendeeId', ParseIntPipe) attendeeId: number,
    @Body() body: UpdateAttendeeDto,
  ) {
    const attendee = await this.attendeesService.updateAttendee(
      bookId,
      attendeeId,
      body,
    );

    return ResponseUtil.success(attendee, 'Attendee updated successfully');
  }

  @Patch('status')
  async updateAttendeeStatus(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() body: UpdateAttendeeStatusDto,
  ) {
    const attendee = await this.attendeesService.updateAttendeeStatus(
      bookId,
      body,
    );

    return ResponseUtil.success(attendee, 'Attendee status updated successfully');
  }
}
