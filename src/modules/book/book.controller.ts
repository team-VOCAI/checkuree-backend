import { Body, Controller, Post, Get, Param, ParseIntPipe, Delete, HttpCode, Patch, UseInterceptors, UploadedFile, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import type { Request, Express } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller(['books', 'book'])
export class BookController {
  constructor(private readonly service: BookService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBookDto, @Req() req: Request) {
    const userId = (req.user as any)?.userId;
    return this.service.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: Request) {
    const userId = (req.user as any)?.userId;
    return this.service.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req.user as any)?.userId;
    return this.service.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookDto, @Req() req: Request) {
    const userId = (req.user as any)?.userId;
    return this.service.update(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req.user as any)?.userId;
    await this.service.remove(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/files')
  @UseInterceptors(FileInterceptor('file'))
  upload(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const userId = (req.user as any)?.userId;
    return this.service.uploadFile(id, file, userId);
  }
}