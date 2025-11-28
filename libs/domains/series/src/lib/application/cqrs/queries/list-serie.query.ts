import { IQuery } from "@nestjs/cqrs";
import { SerieFilter } from "../../utils/types";

export class ListSerieQuery implements IQuery{
  constructor(
    public readonly filters?: SerieFilter
  ) {}
}
