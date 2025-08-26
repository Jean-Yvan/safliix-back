

export class SeasonView {
  constructor(
    public readonly id: string,
    public readonly seasonId: string,
    
    public readonly userId: string,
    public readonly viewedAt: Date = new Date(),

    public readonly episodesWatched = 0,
    public readonly totalTimeSpent = 0, 
    public readonly rating = 0,

    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()

  ) {}
}