import {
  Body,
  Controller,
  Get,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ListUserByIdQuery,
  UpdateUserCommand,
} from '@safliix-back/users';
import {
  ListPurchasesByUserQuery,
} from '@safliix-back/access';
import {
  ListActiveSubscriptionByUserQuery,
  ListExpiredSubscriptionsQuery,
} from '@safliix-back/access';
import { UpdateMeDto } from '@safliix-back/users';
import { RentalsQueryDto as RentalsQuery } from '@safliix-back/access';

type AuthenticatedRequest = Request & { user?: { sub?: string } };

@Controller('users')
export class UserController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @Get('me')
  @UseGuards(AuthGuard('keycloak'))
  async me(@Req() req: AuthenticatedRequest) {
    const result = await this.queryBus.execute(new ListUserByIdQuery(req.user?.sub ?? ''));
    if (result.isErr()) {
      throw result.unwrapErr();
    }
    const user = result.unwrap();
    const [firstName, ...rest] = (user.name ?? '').split(' ');
    const lastName = rest.join(' ').trim() || null;
    return {
      id: user.id,
      firstName: firstName || null,
      lastName,
      email: user.email,
      phone: null,
      country: null,
      avatar: user.avatarUrl,
      roles: ['user'],
    };
  }

  @Put('me')
  @UseGuards(AuthGuard('keycloak'))
  async updateMe(@Body() dto: UpdateMeDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    const fullName =
      dto.firstName || dto.lastName
        ? [dto.firstName, dto.lastName].filter(Boolean).join(' ').trim()
        : undefined;
    const command = new UpdateUserCommand({
      id: userId!,
      email: dto.email,
      name: fullName,
      avatarUrl: undefined,
      lastLoginAt: undefined,
      isVerified: undefined,
      isMainAccount: undefined,
    });
    const result = await this.commandBus.execute(command);
    if (result.isErr()) {
      throw result.unwrapErr();
    }
    return { user: result.unwrap() };
  }

  @Get('me/rentals')
  @UseGuards(AuthGuard('keycloak'))
  async rentals(@Query() query: RentalsQuery, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    const result = await this.queryBus.execute(
      new ListPurchasesByUserQuery(userId!)
    );
    if (result.isErr()) {
      throw result.unwrapErr();
    }
    const rentals = result.unwrap();
    const now = new Date();
    const filtered = rentals.filter((rental: any) => {
      const isActive = rental.expirationDate ? rental.expirationDate > now : true;
      if (!query.status || query.status === 'all') return true;
      return query.status === 'active' ? isActive : !isActive;
    });

    return {
      rentals: filtered.map((rental: any) => ({
        id: rental.id,
        title: rental.movie?.metadata?.title ?? 'Location',
        image: rental.movie?.metadata?.thumbnailUrl,
        expiresAt: rental.expirationDate,
        rating: null,
        quality: 'HD',
        status:
          rental.expirationDate && rental.expirationDate > now ? 'active' : 'expired',
      })),
    };
  }

  @Get('me/subscriptions')
  @UseGuards(AuthGuard('keycloak'))
  async subscriptions(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    const [activeResult, expiredResult] = await Promise.all([
      this.queryBus.execute(new ListActiveSubscriptionByUserQuery(userId!)),
      this.queryBus.execute(new ListExpiredSubscriptionsQuery()),
    ]);
    const active = activeResult?.isOk ? activeResult.unwrap() : [];
    const expiredRaw = expiredResult?.isOk ? expiredResult.unwrap() : [];
    const expired = expiredRaw.filter((sub: any) => sub.userId === userId);
    const all = [...active, ...expired] as any[];

    return {
      history: all.map((sub) => ({
        date: sub.startDate,
        action: 'payment',
        target: sub.plan?.name ?? sub.planId,
        mode: 'card',
        status: sub.endDate && sub.endDate > new Date() ? 'active' : 'expired',
        type: 'subscription',
        currency: 'XOF',
        cost: sub.plan?.price ?? 0,
        tax: 0,
        total: sub.plan?.price ?? 0,
      })),
    };
  }

  @Get('me/rentals/history')
  @UseGuards(AuthGuard('keycloak'))
  async rentalsHistory(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    const result = await this.queryBus.execute(
      new ListPurchasesByUserQuery(userId!)
    );
    if (result.isErr()) {
      throw result.unwrapErr();
    }
    const rentals = result.unwrap();
    return {
      history: rentals.map((rental: any) => ({
        date: rental.purchaseDate,
        action: 'rental',
        film: rental.movie?.metadata?.title ?? 'Location',
        target: rental.movieId,
        mode: 'card',
        status:
          rental.expirationDate && rental.expirationDate > new Date() ? 'active' : 'expired',
        currency: 'XOF',
        cost: 0,
        tax: 0,
        total: 0,
      })),
    };
  }
}
