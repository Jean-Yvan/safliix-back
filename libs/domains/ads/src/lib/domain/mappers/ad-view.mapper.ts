// domain/mappers/ad-view.mapper.ts
import { AdView } from "../entities/ad-view.entity";
import { CreateToPrisma } from "@safliix-back/database";

export class AdViewMapper {
  static toDomain(prismaAdView: any): AdView {
    return AdView.restore(prismaAdView);
  }

  static toPrismaCreate(adView: AdView): CreateToPrisma<"AdView"> {
    return {
      adId: adView.adId,
      userId: adView.userId,
      profileId: adView.profileId,
      viewed_at: adView.viewedAt,
      country: adView.country,
    };
  }
}