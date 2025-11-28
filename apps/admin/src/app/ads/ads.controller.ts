import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ActivateAdCommand,
  Ad,
  AdFilterDto,
  AdStatistics,
  AdView,
  CreateAdCommand,
  CreateAdDto,
  DeactivateAdCommand,
  DeleteAdCommand,
  FindActiveAdsQuery,
  FindAdByIdQuery,
  FindAllAdsQuery,
  FindExpiredAdsQuery,
  GetAdStatisticsQuery,
  GetAdViewsCountQuery,
  GetAdViewsQuery,
  UpdateAdCommand,
  UpdateAdDto,
} from '@safliix-back/ad';
import type { AdStatisticsOptions } from '@safliix-back/ad';
import { Result } from 'oxide.ts';
import { AdStatisticsQueryDto } from './dto/ad-statistics-query.dto';

@ApiTags('Ads')
@Controller('ads')
export class AdsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une publicité' })
  @ApiResponse({ status: 201, description: 'Publicité créée' })
  async create(@Body() dto: CreateAdDto) {
    const result = await this.commandBus.execute(
      new CreateAdCommand(dto),
    ) as Result<Ad, Error>;
    const ad = this.unwrapResult(result);
    return { success: true, data: ad.toPrimitives() };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une publicité' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdDto,
  ) {
    const result = await this.commandBus.execute(
      new UpdateAdCommand(id, dto),
    ) as Result<void, Error>;
    this.unwrapResult(result);
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une publicité' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.commandBus.execute(
      new DeleteAdCommand(id),
    ) as Result<void, Error>;
    this.unwrapResult(result);
    return { success: true };
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activer une publicité' })
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.commandBus.execute(
      new ActivateAdCommand(id),
    ) as Result<void, Error>;
    this.unwrapResult(result);
    return { success: true };
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Désactiver une publicité' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.commandBus.execute(
      new DeactivateAdCommand(id),
    ) as Result<void, Error>;
    this.unwrapResult(result);
    return { success: true };
  }

  @Get()
  @ApiOperation({ summary: 'Lister les publicités' })
  async findAll(@Query() filters: AdFilterDto) {
    const result = await this.queryBus.execute(
      new FindAllAdsQuery(filters),
    ) as Result<Ad[], Error>;
    const ads = this.unwrapResult(result);
    return {
      success: true,
      data: ads.map((ad: Ad) => ad.toPrimitives()),
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Lister les publicités actives' })
  async findActive(@Query('referenceDate') referenceDate?: string) {
    const result = await this.queryBus.execute(
      new FindActiveAdsQuery(this.parseReferenceDate(referenceDate)),
    ) as Result<Ad[], Error>;
    const ads = this.unwrapResult(result);
    return {
      success: true,
      data: ads.map((ad: Ad) => ad.toPrimitives()),
    };
  }

  @Get('expired')
  @ApiOperation({ summary: 'Lister les publicités expirées' })
  async findExpired(@Query('referenceDate') referenceDate?: string) {
    const result = await this.queryBus.execute(
      new FindExpiredAdsQuery(this.parseReferenceDate(referenceDate)),
    ) as Result<Ad[], Error>;
    const ads = this.unwrapResult(result);
    return {
      success: true,
      data: ads.map((ad: Ad) => ad.toPrimitives()),
    };
  }

  @Get(':id/views')
  @ApiOperation({ summary: 'Lister les vues d’une publicité' })
  async getViews(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.queryBus.execute(
      new GetAdViewsQuery(id),
    ) as Result<AdView[], Error>;
    const views = this.unwrapResult(result);
    return {
      success: true,
      data: views.map((view: AdView) => view.toPrimitives()),
    };
  }

  @Get(':id/views/count')
  @ApiOperation({ summary: 'Compter les vues d’une publicité' })
  async getViewsCount(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.queryBus.execute(
      new GetAdViewsCountQuery(id),
    ) as Result<number, Error>;
    const count = this.unwrapResult(result);
    return { success: true, data: count };
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Obtenir les statistiques d’une publicité' })
  async getStatistics(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() dto: AdStatisticsQueryDto,
  ) {
    const options: AdStatisticsOptions | undefined =
      dto.from || dto.to ? { range: { from: dto.from, to: dto.to } } : undefined;
    const result = await this.queryBus.execute(
      new GetAdStatisticsQuery(id, options),
    ) as Result<AdStatistics, Error>;
    return { success: true, data: this.unwrapResult(result) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une publicité par ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.queryBus.execute(
      new FindAdByIdQuery(id),
    ) as Result<Ad, Error>;
    const ad = this.unwrapResult(result);
    return { success: true, data: ad.toPrimitives() };
  }

  private parseReferenceDate(value?: string): Date | undefined {
    if (!value) {
      return undefined;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('referenceDate doit être une date valide');
    }
    return parsed;
  }

  private unwrapResult<T>(result: Result<T, Error>): T {
    if (result.isErr()) {
      throw result.unwrapErr();
    }
    return result.unwrap();
  }
}
