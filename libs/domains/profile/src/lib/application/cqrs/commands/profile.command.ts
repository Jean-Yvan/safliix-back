// libs/shared-account/queries/profile-login.query.ts

import { ICommand } from '@nestjs/cqrs';
import { CreateNewProfileDto } from '../../../interfaces/dto/create-new-profile.dto';



export class AddProfileToAccountCommand implements ICommand {
  constructor(
    public readonly payload: CreateNewProfileDto
  ){}
}