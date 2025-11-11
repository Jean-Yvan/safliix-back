// interfaces/dto/create-ad.dto.ts
export class CreateAdDto {
  title!: string;
  imageUrl!: string;
  startDate!: Date;
  endDate!: Date;
  isActive?: boolean;
}