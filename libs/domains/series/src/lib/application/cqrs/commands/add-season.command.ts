import { AddSeasonDto } from '../../../interfaces/add-season.dto';

export class AddSeasonCommand {
  constructor(
    public readonly payload :  AddSeasonDto
  ){}
}