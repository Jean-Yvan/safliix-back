import { UpdateMovieDto } from "../../interface/rest/dto/update-movie.dto";

export interface UpdateMovieCommandPayload extends UpdateMovieDto {
    id: string;
}

export class UpdateMovieCommand {
  

  constructor(
    public readonly payload: UpdateMovieCommandPayload
  ) {}
}