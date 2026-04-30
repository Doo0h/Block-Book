import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookStatus } from 'src/common/enums/book-status.enum';

export class QueryBooksDto {
  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;
}
