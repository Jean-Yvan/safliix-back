import { CreateAdDto } from '../../interfaces/dto/create-ad.dto';

export class Ad {
  private constructor(
    public readonly id: string | undefined,
    public readonly title: string,
    public readonly imageUrl: string,
    public startDate: Date,
    public endDate: Date,
    public isActive: boolean,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
  ) {}

  static create(data: CreateAdDto): Ad {
    const now = new Date();
    return new Ad(
      undefined,
      data.title,
      data.imageUrl,
      data.startDate,
      data.endDate,
      data.isActive ?? true,
      null,
      null,
    );
  }

  static restore(data: any): Ad {
    return new Ad(
      data.id,
      data.title,
      data.imageUrl,
      data.startDate,
      data.endDate,
      data.isActive,
      data.createdAt,
      data.updatedAt,
    );
  }

  // Méthodes métier
  isCurrentlyActive(): boolean {
    const now = new Date();
    return this.isActive && now >= this.startDate && now <= this.endDate;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  updateDates(startDate: Date, endDate: Date): void {
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }
    this.startDate = startDate;
    this.endDate = endDate;
  }
}