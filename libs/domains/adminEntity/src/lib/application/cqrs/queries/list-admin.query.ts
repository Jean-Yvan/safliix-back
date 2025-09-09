import { AdminFilter } from "../../../utils/types";
import { IQuery } from "@nestjs/cqrs";

export class ListAdminQuery implements IQuery{
  constructor(
    public readonly payload: AdminFilter
  ){}
}