import { CreateSerieDto } from '../../../interfaces/create-serie.dto';

export class CreateSerieCommand {
  constructor(
    public readonly payload :  CreateSerieDto
  ){}
}