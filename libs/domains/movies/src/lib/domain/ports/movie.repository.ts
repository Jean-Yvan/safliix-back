import { MovieAggregate } from "../entities/movie.aggregate";
import { MovieFilter } from "../../utils/types";


export interface IMovieRepository {
  create(movie: MovieAggregate): Promise<MovieAggregate>;
  update(id:string,movie: MovieAggregate): Promise<MovieAggregate>;
  publish(id: string, publicationDate?: Date): Promise<MovieAggregate>;
  save(movie: MovieAggregate): Promise<void>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<MovieAggregate | null>;
  findAll(filters?: MovieFilter): Promise<MovieAggregate[]>;
}