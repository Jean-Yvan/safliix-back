import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { RequestWithProfileContext } from '../profile-context.guard';

export const ProfileContext = createParamDecorator(
  (data: keyof NonNullable<RequestWithProfileContext['profileContext']> | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithProfileContext>();

    if (!request.profileContext) {
      throw new InternalServerErrorException(
        'ProfileContext manquant dans la requête. Avez-vous appliqué ProfileContextGuard ?',
      );
    }

    if (!data) {
      return request.profileContext;
    }

    return request.profileContext[data];
  },
);
