import { ICommand } from '@nestjs/cqrs';
import { CreateSharedAccountDto } from '../../../interfaces/dto/create-shared-account.dto';

export class CreateSharedAccountCommand implements ICommand {
  constructor(public readonly payload: CreateSharedAccountDto) {}
}
