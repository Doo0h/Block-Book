import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BookStatus } from 'src/common/enums/book-status.enum';
import { UsersService } from '../users/users.service';
import { CreateBookDto } from './dto/create-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';
import { Book, BookDocument } from './schemas/book.schema';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(createBookDto: CreateBookDto) {
    await this.usersService.findById(createBookDto.sellerId);
    return this.bookModel.create(createBookDto);
  }

  async findAll(query: QueryBooksDto) {
    const filters: FilterQuery<BookDocument> = {};

    if (query.major) {
      filters.major = query.major;
    }

    if (query.status) {
      filters.status = query.status;
    }

    if (query.keyword) {
      filters.$or = [
        { title: { $regex: query.keyword, $options: 'i' } },
        { author: { $regex: query.keyword, $options: 'i' } },
        { tags: { $regex: query.keyword, $options: 'i' } },
      ];
    }

    return this.bookModel.find(filters).populate('sellerId', 'name department grade').sort({ createdAt: -1 });
  }

  async findById(bookId: string) {
    const book = await this.bookModel.findById(bookId).populate('sellerId', 'name department grade');

    if (!book) {
      throw new NotFoundException('Book not found.');
    }

    return book;
  }

  async updateStatus(bookId: string, status: BookStatus) {
    const book = await this.bookModel.findByIdAndUpdate(bookId, { status }, { new: true });

    if (!book) {
      throw new NotFoundException('Book not found.');
    }

    return book;
  }
}
