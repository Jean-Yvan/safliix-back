// domain/ports/ad.repository.ts
import { Ad } from "../entities/ad.entity";
import { Result } from "oxide.ts";

export interface IAdRepository {
  // CRUD Operations
  create(ad: Ad): Promise<Result<Ad, Error>>;
  update(id: string, ad: Ad): Promise<Result<Ad, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
  findById(id: string): Promise<Result<Ad, Error>>;

  // Query Methods
  findAll(): Promise<Result<Ad[], Error>>;
  findActiveAds(): Promise<Result<Ad[], Error>>;
  findExpiredAds(): Promise<Result<Ad[], Error>>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Result<Ad[], Error>>;
  
  // Analytics
  getAdStatistics(adId: string): Promise<Result<AdStatistics, Error>>;
}

export interface AdStatistics {
  adId: string;
  totalViews: number;
  uniqueViewers: number;
  viewsByCountry: Record<string, number>;
  viewsByDate: Record<string, number>;
}