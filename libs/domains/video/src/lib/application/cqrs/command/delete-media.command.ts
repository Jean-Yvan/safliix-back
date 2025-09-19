import { ICommand } from "@nestjs/cqrs";

export class DeleteMediaFileCommand implements ICommand {
  constructor(
    public readonly id: string,
  ) {}
}