export const MOVIE_REPOSITORY = Symbol('MOVIE_REPOSITORY');
export type MovieFilter = {
  page: number;
  limit: number;
  director?: string;
  format?: string;
  minDuration?: number;
  status?: string;
};