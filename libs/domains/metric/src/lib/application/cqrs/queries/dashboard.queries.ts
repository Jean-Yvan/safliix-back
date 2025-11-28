export class GetDashboardMetricsQuery {
  constructor(
    public readonly from?: Date,
    public readonly to?: Date,
    public readonly range?: string
  ) {}
}

export class GetDashboardHighlightsQuery {}

export class GetDashboardRepartitionQuery {
  constructor(public readonly from?: Date, public readonly to?: Date) {}
}

export class GetFilmStatsQuery {
  constructor(public readonly from?: Date, public readonly to?: Date) {}
}

export class GetRevenueStatsQuery {
  constructor(public readonly from?: Date, public readonly to?: Date) {}
}

export class GetRevenueByContentQuery {
  constructor(public readonly id: string) {}
}

export class GetAdsStatsQuery {}

export class GetAdsStatsByIdQuery {
  constructor(public readonly id: string) {}
}

export class GetUserStatsQuery {}
