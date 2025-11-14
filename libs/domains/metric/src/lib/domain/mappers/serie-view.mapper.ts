import { SeriesView } from '../entities/serie-view.entity';
import { SerieViewToPrisma } from '@safliix-back/database';

export class SeriesViewMapper {
  static toDomain(props: SerieViewToPrisma): SeriesView {
    return SeriesView.restore(props);
  }

  static toPrisma(entity: SeriesView): SerieViewToPrisma {
    return {
      id: entity.id,
      seriesId: entity.seriesId,
      userId: entity.userId,
      seasonsWatched: entity.seasonsWatched,
      episodesWatched: entity.episodesWatched,
      totalTimeSpent: entity.totalTimeSpent,
      rating: entity.rating,
      viewedAt: entity.viewedAt,
    };
  }
}
