import { AdViewWithRelation, CreateToPrisma } from '@safliix-back/database';
import { AdView } from '../entities/ad-view.entity';

export class AdViewMapper {
  static toDomain(data: AdViewWithRelation): AdView {
    return AdView.restore({
      id: data.id,
      adId: data.adId,
      userId: data.userId,
      profileId: data.profileId,
      viewedAt: data.viewed_at,
      country: data.country,
    });
  }

  static toCreatePrisma(view: AdView): CreateToPrisma<'AdView'> {
    const primitive = view.toPrimitives();
    return {
      adId: primitive.adId,
      userId: primitive.userId ?? undefined,
      profileId: primitive.profileId ?? undefined,
      viewed_at: primitive.viewedAt,
      country: primitive.country ?? undefined,
    };
  }
}
