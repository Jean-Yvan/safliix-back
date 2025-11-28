import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateSubscriptionCommand,
  CreateSubscriptionDto,
  ListSubscriptionByIdQuery,
} from '@safliix-back/access';
import { PrismaService } from '@safliix-back/database';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

class SubscriptionListQueryDto {
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  pageSize?: number = 10;
}

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un abonnement' })
  async create(@Body() dto: CreateSubscriptionDto) {
    const command = new CreateSubscriptionCommand(dto);
    const result = await this.commandBus.execute(command);
    if (result.isErr()) {
      throw result.unwrapErr();
    }
    return { success: true, data: result.unwrap() };
  }

  @Get()
  @ApiOperation({ summary: 'Lister les abonnements' })
  async list(@Query() query: SubscriptionListQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 10));

    const [totalItems, items] = await Promise.all([
      this.prisma.subscription.count(),
      this.prisma.subscription.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { startDate: 'desc' },
        include: { user: true, plan: true },
      }),
    ]);

    return {
      success: true,
      data: {
        items,
        pageInfo: {
          page,
          pageSize,
          totalItems,
          totalPages: Math.ceil(totalItems / pageSize),
        },
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail dun abonnement' })
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const query = new ListSubscriptionByIdQuery(id);
    const result = await this.queryBus.execute(query);
    if (result.isErr()) {
      throw result.unwrapErr();
    }
    return { success: true, data: result.unwrap() };
  }
}
