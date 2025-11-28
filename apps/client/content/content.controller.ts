import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddReviewCommand, GetContentQuery, GetEpisodesQuery, GetPlaybackQuery, GetRecommendationsQuery, GetReviewsQuery } from '@safliix-back/contents';
import { ReviewDto } from '@safliix-back/contents';
import { PlaybackQueryDto } from '@safliix-back/contents';

type AuthenticatedRequest = Request & { user?: { sub?: string } };

@Controller('contents')
export class ContentController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @Get(':id')
  async getContent(@Param('id') id: string) {
    return this.queryBus.execute(new GetContentQuery(id));
  }

  @Get(':id/episodes')
  async getEpisodes(@Param('id') id: string) {
    return this.queryBus.execute(new GetEpisodesQuery(id));
  }

  @Get(':id/playback')
  async getPlayback(@Param('id') id: string, @Query() query: PlaybackQueryDto) {
    return this.queryBus.execute(
      new GetPlaybackQuery(id, query.type ?? 'film', query.attachmentType)
    );
  }

  @Get(':id/recommendations')
  async recommendations(@Param('id') id: string) {
    return this.queryBus.execute(new GetRecommendationsQuery(id));
  }

  @Get(':id/reviews')
  async getReviews(@Param('id') id: string) {
    return this.queryBus.execute(new GetReviewsQuery(id));
  }

  @Post(':id/reviews')
  @UseGuards(AuthGuard('keycloak'))
  async addReview(
    @Param('id') id: string,
    @Body() dto: ReviewDto,
    @Req() req: AuthenticatedRequest
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new BadRequestException('Missing user');
    }

    return this.commandBus.execute(
      new AddReviewCommand(id, userId, dto)
    );
  }
}
