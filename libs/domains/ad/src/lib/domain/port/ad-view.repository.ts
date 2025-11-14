import { AdView } from '../entities/ad-view.entity';

export interface ViewsRange {
  from?: Date;
  to?: Date;
}

export interface AdViewRepository {
  create(view: AdView): Promise<AdView>;
  findByAd(adId: string): Promise<AdView[]>;
  countByAd(adId: string, range?: ViewsRange): Promise<number>;
  uniqueViewersCount(adId: string, range?: ViewsRange): Promise<number>;
  viewsByDate(adId: string, range?: ViewsRange): Promise<Record<string, number>>;
  viewsByCountry(
    adId: string,
    range?: ViewsRange,
  ): Promise<Record<string, number>>;
}

export interface AdStatistics {
  adId: string;
  totalViews: number;
  uniqueViewers: number;
  viewsByCountry: Record<string, number>;
  viewsByDate: Record<string, number>;
}
