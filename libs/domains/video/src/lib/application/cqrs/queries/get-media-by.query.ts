import { IQuery } from "@nestjs/cqrs";

export class GetMediaFileByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}