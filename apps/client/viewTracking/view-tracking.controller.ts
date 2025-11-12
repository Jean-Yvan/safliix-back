import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  CreateUserVideoViewCommand,
  CreateUserVideoViewDto,
  DeleteUserVideoViewCommand,
  GetCompletedViewsQuery,
  GetInProgressViewsQuery,
  GetRecentViewsQuery,
  GetUserVideoProgressQuery,
  GetUserVideoViewByIdQuery,
  GetUserVideoViewsByUserAndVideoQuery,
  GetUserWatchTimeQuery,
  GetVideoStatisticsQuery,
  GetWatchHistoryQuery,
  MarkMultipleViewsAsCompletedCommand,
  MarkUserVideoViewAsCompletedCommand,
  RateUserVideoViewCommand,
  UpdateUserVideoProgressBatchCommand,
  UpdateUserVideoProgressCommand,

  UpdateProgressDto,
  RateViewDto,
  ProgressUpdateItemDto,
  UpdateProgressBatchDto,
  MarkMultipleCompletedDto,
  WatchHistoryQueryDto,
  RecentViewsQueryDto,
  WatchTimeQueryDto
} from '@safliix-back/videoTracking';



@ApiTags('ViewTracking')
@Controller('view-tracking')
export class ClientViewTrackingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @ApiOperation({ summary: "Enregistrer une nouvelle vue d'utilisateur" })
  @ApiResponse({ status: 201, description: 'Vue créée' })
  async create(@Body() dto: CreateUserVideoViewDto) {
    const result = await this.commandBus.execute(
      new CreateUserVideoViewCommand(dto)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Patch('view/:viewId/progress')
  @ApiOperation({ summary: "Mettre à jour la progression d'une vue" })
  @ApiParam({ name: 'viewId', description: 'Identifiant de la vue' })
  @ApiResponse({ status: 200, description: 'Progression mise à jour' })
  async updateProgress(
    @Param('viewId') viewId: string,
    @Body() dto: UpdateProgressDto
  ) {
    const result = await this.commandBus.execute(
      new UpdateUserVideoProgressCommand(viewId, dto.progress)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Patch('view/:viewId/complete')
  @ApiOperation({ summary: "Marquer une vue comme terminée" })
  @ApiParam({ name: 'viewId', description: 'Identifiant de la vue' })
  @ApiResponse({ status: 200, description: 'Vue marquée comme terminée' })
  async markCompleted(@Param('viewId') viewId: string) {
    const result = await this.commandBus.execute(
      new MarkUserVideoViewAsCompletedCommand(viewId)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Patch('view/:viewId/rating')
  @ApiOperation({ summary: "Évaluer une vue" })
  @ApiParam({ name: 'viewId', description: 'Identifiant de la vue' })
  @ApiResponse({ status: 200, description: 'Évaluation enregistrée' })
  async rateView(
    @Param('viewId') viewId: string,
    @Body() dto: RateViewDto
  ) {
    const result = await this.commandBus.execute(
      new RateUserVideoViewCommand(viewId, dto.rating)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Delete('view/:viewId')
  @ApiOperation({ summary: "Supprimer une vue" })
  @ApiParam({ name: 'viewId', description: 'Identifiant de la vue' })
  @ApiResponse({ status: 200, description: 'Vue supprimée' })
  async delete(@Param('viewId') viewId: string) {
    const result = await this.commandBus.execute(
      new DeleteUserVideoViewCommand(viewId)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Patch('batch/progress')
  @ApiOperation({ summary: 'Mettre à jour la progression de plusieurs vues' })
  @ApiResponse({ status: 200, description: 'Progressions mises à jour' })
  async updateProgressBatch(@Body() dto: UpdateProgressBatchDto) {
    const result = await this.commandBus.execute(
      new UpdateUserVideoProgressBatchCommand(dto.updates)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Patch('batch/complete')
  @ApiOperation({ summary: 'Marquer plusieurs vues comme terminées' })
  @ApiResponse({ status: 200, description: 'Vues marquées comme terminées' })
  async markMultipleCompleted(@Body() dto: MarkMultipleCompletedDto) {
    const result = await this.commandBus.execute(
      new MarkMultipleViewsAsCompletedCommand(dto.viewIds)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get('view/:viewId')
  @ApiOperation({ summary: "Récupérer une vue par son identifiant" })
  @ApiParam({ name: 'viewId', description: 'Identifiant de la vue' })
  @ApiResponse({ status: 200, description: 'Vue trouvée' })
  async findById(@Param('viewId') viewId: string) {
    const result = await this.queryBus.execute(
      new GetUserVideoViewByIdQuery(viewId)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get('user/:userId/video/:videoId/views')
  @ApiOperation({
    summary: 'Lister les vues dun utilisateur pour une vidéo donnée',
  })
  @ApiParam({ name: 'userId', description: "Identifiant de l'utilisateur" })
  @ApiParam({ name: 'videoId', description: 'Identifiant de la vidéo' })
  @ApiResponse({ status: 200, description: 'Vues correspondantes' })
  async listByUserAndVideo(
    @Param('userId') userId: string,
    @Param('videoId') videoId: string
  ) {
    const result = await this.queryBus.execute(
      new GetUserVideoViewsByUserAndVideoQuery(userId, videoId)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get('user/:userId/video/:videoId/progress')
  @ApiOperation({ summary: "Récupérer la progression d'une vidéo pour un utilisateur" })
  @ApiParam({ name: 'userId', description: "Identifiant de l'utilisateur" })
  @ApiParam({ name: 'videoId', description: 'Identifiant de la vidéo' })
  @ApiResponse({ status: 200, description: 'Progression retrouvée' })
  async getProgress(
    @Param('userId') userId: string,
    @Param('videoId') videoId: string
  ) {
    const result = await this.queryBus.execute(
      new GetUserVideoProgressQuery(userId, videoId)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get('user/:userId/history')
  @ApiOperation({ summary: "Historique des vues d'un utilisateur" })
  @ApiParam({ name: 'userId', description: "Identifiant de l'utilisateur" })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre maximum de vues à retourner' })
  @ApiResponse({ status: 200, description: 'Historique retourné' })
  async getHistory(
    @Param('userId') userId: string,
    @Query() query: WatchHistoryQueryDto
  ) {
    const result = await this.queryBus.execute(
      new GetWatchHistoryQuery(userId, query.limit)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get('user/:userId/completed')
  @ApiOperation({ summary: 'Lister les vidéos complétées par un utilisateur' })
  @ApiParam({ name: 'userId', description: "Identifiant de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Vues complétées listées' })
  async getCompleted(@Param('userId') userId: string) {
    const result = await this.queryBus.execute(
      new GetCompletedViewsQuery(userId)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get('user/:userId/in-progress')
  @ApiOperation({
    summary: 'Lister les vidéos en cours de lecture pour un utilisateur',
  })
  @ApiParam({ name: 'userId', description: "Identifiant de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Vues en cours listées' })
  async getInProgress(@Param('userId') userId: string) {
    const result = await this.queryBus.execute(
      new GetInProgressViewsQuery(userId)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get('user/:userId/recent')
  @ApiOperation({
    summary: 'Lister les vues récentes dun utilisateur',
  })
  @ApiParam({ name: 'userId', description: "Identifiant de l'utilisateur" })
  @ApiQuery({ name: 'days', required: false, description: 'Fenêtre en jours' })
  @ApiResponse({ status: 200, description: 'Vues récentes listées' })
  async getRecent(
    @Param('userId') userId: string,
    @Query() query: RecentViewsQueryDto
  ) {
    const result = await this.queryBus.execute(
      new GetRecentViewsQuery(userId, query.days)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get('user/:userId/watch-time')
  @ApiOperation({
    summary: 'Obtenir le temps de visionnage agrégé pour un utilisateur',
  })
  @ApiParam({ name: 'userId', description: "Identifiant de l'utilisateur" })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Période à agréger (day, week, month)',
  })
  @ApiResponse({ status: 200, description: 'Temps de visionnage retourné' })
  async getWatchTime(
    @Param('userId') userId: string,
    @Query() query: WatchTimeQueryDto
  ) {
    const result = await this.queryBus.execute(
      new GetUserWatchTimeQuery(userId, query.period)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get('video/:videoId/statistics')
  @ApiOperation({ summary: 'Récupérer les statistiques dune vidéo' })
  @ApiParam({ name: 'videoId', description: 'Identifiant de la vidéo' })
  @ApiResponse({ status: 200, description: 'Statistiques retournées' })
  async getVideoStats(@Param('videoId') videoId: string) {
    const result = await this.queryBus.execute(
      new GetVideoStatisticsQuery(videoId)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }
}
