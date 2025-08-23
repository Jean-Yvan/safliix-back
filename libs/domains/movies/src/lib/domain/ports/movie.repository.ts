import { MovieAggregate } from "../entities/movie.aggregate";
import { MovieFilter } from "../../utils/types";

export interface IMovieRepository {
  create(movie: MovieAggregate): Promise<void>;
  update(movie: MovieAggregate): Promise<void>;
  publish(id: string, publicationDate?: Date): Promise<MovieAggregate>;
  save(movie: MovieAggregate): Promise<void>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<MovieAggregate | null>;
  findAll(filters?: MovieFilter): Promise<MovieAggregate[]>;
}