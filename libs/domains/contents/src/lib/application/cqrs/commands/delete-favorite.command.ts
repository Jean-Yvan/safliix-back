export class DeleteFavoriteCommand {
  constructor(public readonly userId: string, public readonly contentId: string) {}
}
