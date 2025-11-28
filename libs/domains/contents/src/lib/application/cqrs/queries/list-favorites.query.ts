export class ListFavoritesQuery {
  constructor(
    public readonly userId: string,
    public readonly type?: 'film' | 'serie'
  ) {}
}
