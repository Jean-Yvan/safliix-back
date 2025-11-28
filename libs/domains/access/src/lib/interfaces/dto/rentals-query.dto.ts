import { IsOptional, IsString } from 'class-validator';

export class RentalsQueryDto {
  @IsOptional()
  @IsString()
  status?: 'active' | 'expired' | 'all';
}
