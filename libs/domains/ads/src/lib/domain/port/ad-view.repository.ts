// domain/ports/ad-view.repository.ts
import { AdView } from "../entities/ad-view.entity";
import { Result } from "oxide.ts";

export interface IAdViewRepository {
  // CRUD Operations
  create(adView: AdView): Promise<Result<AdView, Error>>;
  
  // Query Methods
  findByAd(adId: string): Promise<Result<AdView[], Error>>;
  findByUser(userId: string): Promise<Result<AdView[], Error>>;
  findByProfile(profileId: string): Promise<Result<AdView[], Error>>;
  getViewsCount(adId: string): Promise<Result<number, Error>>;
  getUniqueViewersCount(adId: string): Promise<Result<number, Error>>;
  
  // Analytics
  getViewsByDate(adId: string, startDate: Date, endDate: Date): Promise<Result<AdView[], Error>>;
  getViewsByCountry(adId: string): Promise<Result<Record<string, number>, Error>>;
}