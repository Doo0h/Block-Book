import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { BookCondition } from 'src/common/enums/book-condition.enum';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsString()
  @IsNotEmpty()
  major: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  price: number;

  @IsEnum(BookCondition)
  condition: BookCondition;

  @IsMongoId()
  sellerId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}
