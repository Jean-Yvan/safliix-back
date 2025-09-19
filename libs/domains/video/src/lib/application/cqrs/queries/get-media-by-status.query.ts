import { IQuery } from "@nestjs/cqrs";
import { MediaFileStatus } from "@safliix-back/database";
export class GetMediaFileByStatusQuery implements IQuery {
  constructor(public readonly status: MediaFileStatus) {}
}