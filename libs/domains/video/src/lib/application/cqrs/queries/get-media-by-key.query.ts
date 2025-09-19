import { IQuery } from "@nestjs/cqrs";

export class GetMediaFileByKeyQuery implements IQuery {
  constructor(public readonly s3Key: string) {}
}