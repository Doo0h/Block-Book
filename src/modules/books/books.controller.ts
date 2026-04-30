import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  findAll(@Query() query: QueryBooksDto) {
    return this.booksService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findById(id);
  }
}
