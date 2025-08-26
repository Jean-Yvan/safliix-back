import { ApiProperty } from '@nestjs/swagger';


export class MovieResponseDto {
  @ApiProperty({ example: '1', description: 'Unique identifier for the movie' })
  id!: string;
  @ApiProperty({ example: 'Inception', description: 'Title of the movie' })
  title!: string;
  @ApiProperty({ example: 'A mind-bending thriller', description: 'Description of the movie' })
  description!: string;
  releaseDate!: Date;
  director!: string;
  genre!: string[];
  rating!: number;
  createdAt!: Date;
  updatedAt!: Date;
}