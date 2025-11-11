import { Err, Ok, Result } from 'oxide.ts';
import { CreateAdDto } from '../../interfaces/dto/create-ad.dto';
import { UpdateAdDto } from '../../interfaces/dto/update-ad.dto';

export interface AdPrimitives {
  id?: string;
  title: string;
  imageUrl: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export class Ad {
  private constructor(private readonly props: AdPrimitives) {}

  static create(dto: CreateAdDto): Result<Ad, Error> {
    if (!dto.title?.trim()) {
      return Err(new Error('Ad title is required'));
    }
    if (!dto.imageUrl) {
      return Err(new Error('Ad image url is required'));
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (Number.isNaN(startDate.getTime())) {
      return Err(new Error('Invalid start date'));
    }
    if (Number.isNaN(endDate.getTime())) {
      return Err(new Error('Invalid end date'));
    }
    if (startDate >= endDate) {
      return Err(new Error('Start date must be before end date'));
    }

    return Ok(
      new Ad({
        title: dto.title.trim(),
        imageUrl: dto.imageUrl,
        startDate,
        endDate,
        isActive: dto.isActive ?? true,
      }),
    );
  }

  static restore(data: AdPrimitives): Ad {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    return new Ad({
      ...data,
      startDate,
      endDate,
    });
  }

  update(dto: UpdateAdDto): Result<Ad, Error> {
    const title = dto.title?.trim() ?? this.props.title;
    const imageUrl = dto.imageUrl ?? this.props.imageUrl;
    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : this.props.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : this.props.endDate;
    const isActive = dto.isActive ?? this.props.isActive;

    if (Number.isNaN(startDate.getTime())) {
      return Err(new Error('Invalid start date'));
    }
    if (Number.isNaN(endDate.getTime())) {
      return Err(new Error('Invalid end date'));
    }
    if (startDate >= endDate) {
      return Err(new Error('Start date must be before end date'));
    }

    return Ok(
      new Ad({
        ...this.props,
        title,
        imageUrl,
        startDate,
        endDate,
        isActive,
      }),
    );
  }

  activate(): Ad {
    if (this.props.isActive) {
      return this;
    }
    return new Ad({
      ...this.props,
      isActive: true,
    });
  }

  deactivate(): Ad {
    if (!this.props.isActive) {
      return this;
    }
    return new Ad({
      ...this.props,
      isActive: false,
    });
  }

  isCurrentlyActive(reference: Date = new Date()): boolean {
    return (
      this.props.isActive &&
      reference >= this.props.startDate &&
      reference <= this.props.endDate
    );
  }

  toPrimitives(): AdPrimitives {
    return { ...this.props };
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get imageUrl(): string {
    return this.props.imageUrl;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

}
