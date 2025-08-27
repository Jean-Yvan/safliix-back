// entities/series-view.entity.ts
import { SerieViewToPrisma } from "@safliix-back/database";
import { Result, Ok, Err } from "oxide.ts";

export class SeriesView {
  private constructor(
    public readonly id: string | undefined,
    public readonly seriesId: string,
    public readonly userId: string,
    public readonly seasonsWatched: number,
    public readonly episodesWatched: number,
    public readonly totalTimeSpent: number,
    public readonly rating: number | null,
    public readonly viewedAt: Date,
    public readonly createdAt: Date | undefined,
    public readonly updatedAt: Date | undefined,
  ) {}

  static create(params: {
    seriesId: string;
    userId: string;
    seasonsWatched?: number;
    episodesWatched?: number;
    totalTimeSpent?: number;
    rating?: number;
    viewedAt?: Date;
  }): Result<SeriesView, Error> {
    if ((params.seasonsWatched ?? 0) < 0) {
      return Err(new Error("seasonsWatched cannot be negative"));
    }

    if ((params.episodesWatched ?? 0) < 0) {
      return Err(new Error("episodesWatched cannot be negative"));
    }

    if ((params.totalTimeSpent ?? 0) < 0) {
      return Err(new Error("totalTimeSpent cannot be negative"));
    }

    if (params.rating !== undefined && (params.rating < 0 || params.rating > 5)) {
      return Err(new Error("Rating must be between 0 and 5"));
    }

    const sv = new SeriesView(
      undefined,
      params.seriesId,
      params.userId,
      params.seasonsWatched ?? 0,
      params.episodesWatched ?? 0,
      params.totalTimeSpent ?? 0,
      params.rating ?? null,
      params.viewedAt ?? new Date(),
      undefined,
      undefined,
    );

    return Ok(sv);
  }

  static restore(props: SerieViewToPrisma): SeriesView {
    return new SeriesView(
      props.id,
      props.seriesId,
      props.userId,
      props.seasonWatched ?? 0,
      props.episodeWatched ?? 0,
      props.totalTimeSpent ?? 0,
      props.rating,
      props.viewedAt,
      props.createdAt,
      props.updatedAt,
    );
  }
}
