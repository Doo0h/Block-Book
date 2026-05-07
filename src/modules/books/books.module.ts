import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { Book, BookSchema } from './schemas/book.schema';
import { OnChainBook, OnChainBookSchema } from './schemas/on-chain-book.schema';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: OnChainBook.name, schema: OnChainBookSchema },
    ]),
    UsersModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService, MongooseModule],
})
export class BooksModule {}
