import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackProfileModule } from '@safliix-back/profile';
import { SafliixBackUsersModule } from '@safliix-back/users';
import { ProfileAuthApplicationService } from './services/profile-auth.service';
import { ClientProfileController } from './profile.controller';

@Module({
  imports: [CqrsModule, SafliixBackProfileModule, SafliixBackUsersModule],
  controllers: [ClientProfileController],
  providers: [ProfileAuthApplicationService],
})
export class ProfileModule {}
