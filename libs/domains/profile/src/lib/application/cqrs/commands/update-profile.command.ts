import { ICommand } from '@nestjs/cqrs';
import { SharedAccountUser } from '../../../domain/entities/shared-account-user.entity';

export class UpdateProfileCommand implements ICommand {
  constructor(
    public readonly profileId: string,
    public readonly updates: Partial<
      Pick<SharedAccountUser, 'profileName' | 'avatarUrl' | 'pinCode'>
    >,
  ) {}
}
