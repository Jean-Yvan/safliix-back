import { Body, Controller, Delete, Get, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateFavoriteCommand,
  DeleteFavoriteCommand,
  ListFavoritesQuery,
  ToggleFavoriteCommand,
} from '@safliix-back/contents';
import { CreateUserVideoViewCommand, CreateUserVideoViewDto } from '@safliix-back/videoTracking';
import { FavoriteDto, ListFavoritesQueryDto } from '@safliix-back/contents';
import { ViewDto } from '@safliix-back/videoTracking';

type AuthenticatedRequest = Request & { user?: { sub?: string } };

@Controller('interactions')
export class InteractionsController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post('favorite')
  @UseGuards(AuthGuard('keycloak'))
  async toggleFavorite(@Body() dto: FavoriteDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException();
    }

    const result = await this.commandBus.execute(
      new ToggleFavoriteCommand(userId, dto.id, dto.type, dto.title, dto.image)
    );
    return result;
  }

  @Post('favorites')
  @UseGuards(AuthGuard('keycloak'))
  async createFavorite(@Body() dto: FavoriteDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.commandBus.execute(
      new CreateFavoriteCommand(userId, dto.id, dto.type, dto.title, dto.image)
    );
  }

  @Delete('favorites')
  @UseGuards(AuthGuard('keycloak'))
  async deleteFavorite(@Body() dto: FavoriteDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.commandBus.execute(new DeleteFavoriteCommand(userId, dto.id));
  }

  @Get('favorites')
  @UseGuards(AuthGuard('keycloak'))
  async listFavorites(@Query() query: ListFavoritesQueryDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.queryBus.execute(new ListFavoritesQuery(userId, query.type));
  }

  @Post('view')
  @UseGuards(AuthGuard('keycloak'))
  async logView(@Body() dto: ViewDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException();
    }

    const createDto = new CreateUserVideoViewDto();
    createDto.userId = userId;
    createDto.videoId = dto.id;
    createDto.progress = dto.timestamp ?? 0;
    const result = await this.commandBus.execute(
      new CreateUserVideoViewCommand(createDto)
    );
    if (result?.isErr?.()) {
      throw result.unwrapErr();
    }
    return { logged: true };
  }
}
