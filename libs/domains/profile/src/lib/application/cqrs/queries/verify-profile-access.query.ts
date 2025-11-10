import { IQuery } from '@nestjs/cqrs';

export class VerifyProfileAccessQuery implements IQuery {
  constructor(public readonly profileId: string, public readonly pinCode: number) {}
}
