export const MOVIE_REPOSITORY = Symbol('MOVIE_REPOSITORY');
export type MovieFilters = {
  status?: 'DRAFT' | 'PUBLISHED';
  category?: string;
  isPremiere?: boolean;
};