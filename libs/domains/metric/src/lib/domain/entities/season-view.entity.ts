import { SeasonViewWithRelation } from '@safliix-back/database';
import { Result, Ok, Err } from 'oxide.ts';

export class SeasonView {
  private constructor(
    public readonly id: string | undefined,
    public readonly seasonId: string,
    public readonly userId: string,
    public readonly episodesWatched: number,
    public readonly totalTimeSpent: number,
    public readonly rating: number | null,
    public readonly viewedAt: Date,
    public readonly createdAt: Date | undefined,
    public readonly updatedAt: Date | undefined,
  ) {}

  static create(params: {
    seasonId: string;
    userId: string;
    episodesWatched?: number;
    totalTimeSpent?: number;
    rating?: number;
    viewedAt?: Date;
  }): Result<SeasonView, Error> {
    if ((params.episodesWatched ?? 0) < 0) {
      return Err(new Error('episodesWatched cannot be negative'));
    }

    if ((params.totalTimeSpent ?? 0) < 0) {
      return Err(new Error('totalTimeSpent cannot be negative'));
    }

    if (params.rating !== undefined && (params.rating < 0 || params.rating > 5)) {
      return Err(new Error('Rating must be between 0 and 5'));
    }

    const view = new SeasonView(
      undefined,
      params.seasonId,
      params.userId,
      params.episodesWatched ?? 0,
      params.totalTimeSpent ?? 0,
      params.rating ?? null,
      params.viewedAt ?? new Date(),
      undefined,
      undefined,
    );

    return Ok(view);
  }

  static restore(props: SeasonViewWithRelation): SeasonView {
    return new SeasonView(
      props.id,
      props.seasonId,
      props.userId,
      props.episodesWatched ?? 0,
      props.totalTimeSpent ?? 0,
      props.rating ?? null,
      props.viewedAt,
      props.createdAt,
      props.updatedAt,
    );
  }
}
