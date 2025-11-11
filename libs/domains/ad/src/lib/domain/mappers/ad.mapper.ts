import {
  AdWithRelation,
  CreateToPrisma,
  UpdateToPrisma,
} from '@safliix-back/database';
import { Ad, AdPrimitives } from '../entities/ad.entity';

export class AdMapper {
  static toDomain(data: AdWithRelation): Ad {
    return Ad.restore(this.fromPrisma(data));
  }

  static toCreatePrisma(ad: Ad): CreateToPrisma<'Ad'> {
    const primitive = ad.toPrimitives();
    return {
      title: primitive.title,
      imageUrl: primitive.imageUrl,
      startDate: primitive.startDate,
      endDate: primitive.endDate,
      isActive: primitive.isActive,
    };
  }

  static toUpdatePrisma(ad: Ad): UpdateToPrisma<'Ad'> {
    const primitive = ad.toPrimitives();
    if (!primitive.id) {
      throw new Error('Cannot update an Ad without id');
    }
    return {
      where: { id: primitive.id },
      data: {
        title: primitive.title,
        imageUrl: primitive.imageUrl,
        startDate: primitive.startDate,
        endDate: primitive.endDate,
        isActive: primitive.isActive,
      },
    };
  }

  private static fromPrisma(data: AdWithRelation): AdPrimitives {
    return {
      id: data.id,
      title: data.title,
      imageUrl: data.imageUrl,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive,
    };
  }
}
