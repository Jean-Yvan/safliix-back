// domain/mappers/ad.mapper.ts
import { Ad } from "../entities/ad.entity";
import { CreateToPrisma, UpdateToPrisma } from "@safliix-back/database";

export class AdMapper {
  static toDomain(prismaAd: any): Ad {
    return Ad.restore(prismaAd);
  }

  static toPrismaCreate(ad: Ad): CreateToPrisma<"Ad"> {
    return {
      title: ad.title,
      imageUrl: ad.imageUrl,
      startDate: ad.startDate,
      endDate: ad.endDate,
      isActive: ad.isActive,
    };
  }

  static toPrismaUpdate(id: string, ad: Ad): UpdateToPrisma<"Ad"> {
    return {
      where: { id },
      data: {
        title: ad.title,
        imageUrl: ad.imageUrl,
        startDate: ad.startDate,
        endDate: ad.endDate,
        isActive: ad.isActive,
      }
    };
  }
}