import { CreateMovieDto } from "src/lib/interface/rest/dto/create-movie.dto";


export class CreateMovieCommand {
  constructor(
    public readonly payload: CreateMovieDto
  ) {}

  
}