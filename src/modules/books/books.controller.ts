import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';
import { RegisterBookOnChainDto } from './dto/register-book-on-chain.dto';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Post('on-chain')
  registerOnChain(@Body() registerBookOnChainDto: RegisterBookOnChainDto) {
    return this.booksService.registerOnChain(registerBookOnChainDto);
  }

  @Get('on-chain')
  findOnChainBooks() {
    return this.booksService.findOnChainBooks();
  }

  @Get('wallet/status')
  getWalletStatus() {
    return this.booksService.getWalletStatus();
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
