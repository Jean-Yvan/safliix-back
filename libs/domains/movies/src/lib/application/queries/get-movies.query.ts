import { MovieFilterDto } from "src/lib/interface/rest/dto/movie-filter.dto";


export class GetMoviesQuery {
  constructor(
    public readonly filters? : MovieFilterDto
  ) {}
}