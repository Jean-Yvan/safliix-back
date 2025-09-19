import { MovieFilterDto } from "../../../interface/rest/dto/movie-filter.dto";

import { IQuery } from "@nestjs/cqrs";

export class GetMoviesQuery implements IQuery{
  constructor(
    public readonly filters? : MovieFilterDto
  ) {}
}