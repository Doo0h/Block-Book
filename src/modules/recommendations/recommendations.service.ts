import { Injectable } from '@nestjs/common';
import { BooksService } from '../books/books.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly booksService: BooksService,
  ) {}

  async getForUser(userId: string) {
    const user = await this.usersService.findById(userId);
    const books = await this.booksService.findAll({
      major: user.department,
    });

    return books
      .filter((book) => String(book.sellerId?._id ?? book.sellerId) !== userId)
      .map((book) => ({
        ...book.toObject(),
        recommendationReason: this.getReason(user.department, user.grade, book.tags),
      }))
      .slice(0, 10);
  }

  private getReason(department: string, grade: number, tags: string[] = []) {
    if (tags.some((tag) => tag.toLowerCase().includes('core'))) {
      return `${department} 전공 필수 과목에 적합한 추천 도서입니다.`;
    }

    if (grade <= 2) {
      return `${department} 저학년 학생에게 적합한 입문형 전공서입니다.`;
    }

    return `${department} 전공 심화 학습에 적합한 추천 도서입니다.`;
  }
}
