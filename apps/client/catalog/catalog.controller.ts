import { Controller, Get, Query, Req } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ListSubscriptionPlanQuery } from '@safliix-back/access';
import { CatalogSectionQuery, ListCatalogSectionsQuery, SearchCatalogQuery, SearchQuery } from '@safliix-back/contents';
import type { Request } from 'express';

@Controller()
export class CatalogController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('plans')
  async listPlans() {
    const result = await this.queryBus.execute(new ListSubscriptionPlanQuery());
    if (result?.isErr?.()) {
      throw result.unwrapErr();
    }
    if (typeof result?.isErr === 'function' && result.isErr()) {
      throw result.unwrapErr();
    }
    if (typeof result?.unwrap === 'function') {
      return result.unwrap();
    }
    return result;
  }

  @Get('catalog/sections')
  async sections(@Query() query: CatalogSectionQuery, @Req() req: Request & { user?: { sub?: string } }) {
    const type: 'film' | 'serie' | 'all' = query.type ?? 'all';
    const section = query.section ?? 'recommended';
    const userId = query.userId ?? req.user?.sub;

    return this.queryBus.execute(new ListCatalogSectionsQuery(type, section, userId));
  }

  @Get('search')
  async search(@Query() query: SearchQuery, @Req() req: Request & { user?: { sub?: string } }) {
    const userId = query.userId ?? req.user?.sub;
    return this.queryBus.execute(
      new SearchCatalogQuery({
        q: query.q,
        type: query.type,
        genre: query.genre,
        badge: query.badge,
        userId,
      })
    );
  }
}
