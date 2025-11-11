import { Err, Ok, Result } from 'oxide.ts';
import { CreateAdViewDto } from '../../interfaces/dto/create-ad-view.dto';

export interface AdViewPrimitives {
  id?: string;
  adId: string;
  userId?: string | null;
  profileId?: string | null;
  viewedAt: Date;
  country?: string | null;
}

export class AdView {
  private constructor(private readonly props: AdViewPrimitives) {}

  static create(dto: CreateAdViewDto): Result<AdView, Error> {
    if (!dto.adId) {
      return Err(new Error('adId is required to track a view'));
    }
    const viewedAt = dto.viewedAt ? new Date(dto.viewedAt) : new Date();
    if (Number.isNaN(viewedAt.getTime())) {
      return Err(new Error('Invalid viewedAt value'));
    }

    return Ok(
      new AdView({
        adId: dto.adId,
        userId: dto.userId,
        profileId: dto.profileId,
        viewedAt,
        country: dto.country,
      }),
    );
  }

  static restore(data: AdViewPrimitives): AdView {
    return new AdView({
      ...data,
      viewedAt: new Date(data.viewedAt),
    });
  }

  toPrimitives(): AdViewPrimitives {
    return { ...this.props };
  }

  get adId(): string {
    return this.props.adId;
  }

  get viewedAt(): Date {
    return this.props.viewedAt;
  }
}
