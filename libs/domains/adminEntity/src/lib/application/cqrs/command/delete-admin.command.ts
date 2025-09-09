import { ICommand } from "@nestjs/cqrs";

export class DeleteAdminCommand implements ICommand{
  constructor(
    public readonly id: string
  ){}
}