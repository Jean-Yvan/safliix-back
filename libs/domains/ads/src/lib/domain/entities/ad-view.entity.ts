// domain/entities/ad-view.entity.ts
export class AdView {
  private constructor(
    public readonly id: string | undefined,
    public readonly adId: string,
    public readonly userId: string | undefined,
    public readonly profileId: string | undefined,
    public readonly viewedAt: Date,
    public readonly country: string | undefined,
    public readonly createdAt: Date | null,
  ) {}

  static create(data: CreateAdViewDto): AdView {
    return new AdView(
      undefined,
      data.adId,
      data.userId,
      data.profileId,
      data.viewedAt ?? new Date(),
      data.country,
      null,
    );
  }

  static restore(data: any): AdView {
    return new AdView(
      data.id,
      data.adId,
      data.userId,
      data.profileId,
      data.viewedAt,
      data.country,
      data.createdAt,
    );
  }
}