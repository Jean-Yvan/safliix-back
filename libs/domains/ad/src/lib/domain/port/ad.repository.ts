import { Ad } from '../entities/ad.entity';
import { AdFilter } from '../types/ad-filter.type';

export interface AdRepository {
  create(ad: Ad): Promise<Ad>;
  save(ad: Ad): Promise<Ad>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Ad | null>;
  findAll(filters?: AdFilter): Promise<Ad[]>;
  findActive(referenceDate?: Date): Promise<Ad[]>;
  findExpired(referenceDate?: Date): Promise<Ad[]>;
}
