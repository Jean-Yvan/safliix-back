import { MovieFilters } from "../../utils/types";

export class GetMoviesQuery {
  constructor(
    public readonly filters? : MovieFilters
  ) {}
}