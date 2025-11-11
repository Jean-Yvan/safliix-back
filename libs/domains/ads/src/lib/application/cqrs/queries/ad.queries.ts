import { IQuery } from "@nestjs/cqrs";

// application/queries/impl/index.ts
export class FindAdByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}

export class FindAllAdsQuery implements IQuery {
  constructor(public readonly activeOnly?: boolean) {}
}

export class FindActiveAdsQuery implements IQuery {}

export class FindExpiredAdsQuery implements IQuery {}

export class GetAdStatisticsQuery implements IQuery {
  constructor(public readonly adId: string) {}
}

export class GetAdViewsQuery implements IQuery {
  constructor(public readonly adId: string) {}
}

export class GetAdViewsCountQuery implements IQuery {
  constructor(public readonly adId: string) {}
}