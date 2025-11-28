export class SearchCatalogQuery {
  constructor(
    public readonly payload: {
      q: string;
      type?: 'film' | 'serie';
      genre?: string;
      badge?: string;
      userId?: string;
    }
  ) {}
}
