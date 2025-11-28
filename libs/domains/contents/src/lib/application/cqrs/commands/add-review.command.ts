export class AddReviewCommand {
  constructor(
    public readonly contentId: string,
    public readonly userId: string,
    public readonly payload: { rating: number; content: string; anonymous?: boolean }
  ) {}
}
