import { Type } from 'class-transformer';
import { IsDate, IsISBN, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  author!: string;

  @IsString()
  @IsNotEmpty()
  @IsISBN('any')
  @MaxLength(20)
  isbn!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100000)
  totalCopies!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  genreId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishedAt?: Date;
}
