// interfaces/dto/create-ad-view.dto.ts
export class CreateAdViewDto {
  adId: string;
  userId?: string;
  profileId?: string;
  country?: string;
  viewedAt?: Date;
}