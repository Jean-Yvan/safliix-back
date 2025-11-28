export class ToggleFavoriteCommand {
  constructor(
    public readonly userId: string,
    public readonly contentId: string,
    public readonly contentType: 'film' | 'serie',
    public readonly title?: string,
    public readonly image?: string
  ) {}
}
