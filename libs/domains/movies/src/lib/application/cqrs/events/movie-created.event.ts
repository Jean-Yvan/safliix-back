export class MovieCreatedEvent {
  constructor(
    public readonly movieId: string,
    public readonly title: string,
    public readonly createdAt: Date = new Date(),
  ) {}
}
