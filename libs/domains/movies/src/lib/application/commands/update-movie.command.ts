import { UpdateMovieDto } from "../../interface/rest/dto/update-movie.dto";

export class UpdateMovieCommand {
  constructor(
    public readonly payload : UpdateMovieDto
  ) {}
}