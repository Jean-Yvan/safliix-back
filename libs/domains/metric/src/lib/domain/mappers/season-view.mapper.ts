import { SeasonView } from '../entities/season-view.entity';
import { SeasonViewToPrisma } from '@safliix-back/database';

export class SeasonViewMapper {
  static toDomain(props: SeasonViewToPrisma): SeasonView {
    return SeasonView.restore(props);
  }

  static toPrisma(entity: SeasonView): SeasonViewToPrisma {
    return {
      id: entity.id,
      seasonId: entity.seasonId,
      userId: entity.userId,
      episodesWatched: entity.episodesWatched,
      totalTimeSpent: entity.totalTimeSpent,
      rating: entity.rating,
      viewedAt: entity.viewedAt,
    };
  }
}
