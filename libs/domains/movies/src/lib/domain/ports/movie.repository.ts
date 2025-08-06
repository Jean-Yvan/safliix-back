import { MovieAggregate } from "../entities/movie.aggregate";


export interface IMovieRepository {
  findById(id: string): Promise<MovieAggregate | null>;
  save(movie: MovieAggregate): Promise<void>;
}