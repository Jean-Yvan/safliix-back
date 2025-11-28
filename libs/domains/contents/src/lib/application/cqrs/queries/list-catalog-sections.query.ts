import { CatalogSectionKey } from '../../../interfaces/dto/catalog.dto';

export class ListCatalogSectionsQuery {
  constructor(
    public readonly type: 'film' | 'serie' | 'all',
    public readonly section: CatalogSectionKey = 'recommended',
    public readonly userId?: string
  ) {}
}
