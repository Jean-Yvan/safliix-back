import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import {
  GetAdsStatsByIdQuery,
  GetAdsStatsQuery,
  GetDashboardHighlightsQuery,
  GetDashboardMetricsQuery,
  GetDashboardRepartitionQuery,
  GetFilmStatsQuery,
  GetRevenueByContentQuery,
  GetRevenueStatsQuery,
  GetUserStatsQuery,
} from '@safliix-back/metric';

type DateRange = { from?: Date; to?: Date };

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException('Invalid date');
  }
  return parsed;
}

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Métriques globales du dashboard' })
  async getMetrics(@Query('from') from?: string, @Query('to') to?: string, @Query('range') range?: string) {
    const parsedFrom = parseDate(from);
    const parsedTo = parseDate(to);
    const data = await this.queryBus.execute(
      new GetDashboardMetricsQuery(parsedFrom, parsedTo, range)
    );
    return { success: true, data };
  }

  @Get('highlights')
  @ApiOperation({ summary: 'Contenus récents et pays en tendance' })
  async getHighlights() {
    const data = await this.queryBus.execute(new GetDashboardHighlightsQuery());
    return { success: true, data };
  }

  @Get('repartition')
  @ApiOperation({ summary: 'Répartition géographique et par produit' })
  async getRepartition(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const range: DateRange = { from: parseDate(from), to: parseDate(to) };
    const data = await this.queryBus.execute(
      new GetDashboardRepartitionQuery(range.from, range.to),
    );
    return { success: true, data };
  }

  @Get('stats/films')
  @ApiOperation({ summary: 'Stats de visionnage ou achat des films' })
  async getFilmStats(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const range: DateRange = { from: parseDate(from), to: parseDate(to) };
    const data = await this.queryBus.execute(
      new GetFilmStatsQuery(range.from, range.to),
    );
    return { success: true, data };
  }

  @Get('stats/revenue')
  @ApiOperation({ summary: 'Agrégats de revenus' })
  async getRevenue(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const range: DateRange = { from: parseDate(from), to: parseDate(to) };
    const data = await this.queryBus.execute(
      new GetRevenueStatsQuery(range.from, range.to),
    );
    return { success: true, data };
  }

  @Get('stats/revenue/:id')
  @ApiOperation({ summary: 'Détail revenu par contenu' })
  async getRevenueByContent(@Param('id') id: string) {
    const data = await this.queryBus.execute(new GetRevenueByContentQuery(id));
    return { success: true, data };
  }

  @Get('stats/pub')
  @ApiOperation({ summary: 'Statistiques publicitaires' })
  async getAdsStats() {
    const data = await this.queryBus.execute(new GetAdsStatsQuery());
    return { success: true, data };
  }

  @Get('stats/pub/:id')
  @ApiOperation({ summary: 'Détail campagne' })
  async getAdsStatsById(@Param('id') id: string) {
    const data = await this.queryBus.execute(new GetAdsStatsByIdQuery(id));
    return { success: true, data };
  }

  @Get('stats/users')
  @ApiOperation({ summary: 'Stats utilisateurs' })
  async getUserStats() {
    const data = await this.queryBus.execute(new GetUserStatsQuery());
    return { success: true, data };
  }
}
