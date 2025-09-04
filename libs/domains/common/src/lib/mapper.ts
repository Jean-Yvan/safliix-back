/* export type NestedRelationMapper<TDomain, TCreate, TUpdate> = {
  toPrismaCreate: (data: TDomain) => TCreate;
  toPrismaUpdate: (data: TDomain) => TUpdate;
};

export class AutoMapper<
  TDomain extends { id?: string },
  TCreatePrisma,
  TUpdatePrisma,
  TNested extends Record<string, NestedRelationMapper<any, any, any>> = {}
> {
  constructor(protected nestedMappers: TNested = {} as TNested) {}

  toPrisma(
    data: TDomain,
    isUpdate = false,
    nestedUpsert: (keyof TNested)[] = []
  ): TCreatePrisma | TUpdatePrisma {
    // Validation early return
    if (isUpdate && !data.id) {
      throw new Error("id is required for update");
    }

    const base: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      // Skip undefined values
      if (value === undefined) {
        continue;
      }

      const nestedMapper = this.nestedMappers[key as keyof TNested];
      
      if (nestedMapper) {
        // Gestion des relations nested
        this.handleNestedRelation(
          base,
          key,
          value,
          nestedMapper,
          isUpdate,
          nestedUpsert.includes(key as keyof TNested)
        );
      } else {
        // Champ scalaire
        base[key] = value;
      }
    }

    return base as TCreatePrisma | TUpdatePrisma;
  }

  private handleNestedRelation(
    base: Record<string, unknown>,
    key: string,
    value: unknown,
    mapper: NestedRelationMapper<any, any, any>,
    isUpdate: boolean,
    useUpsert: boolean
  ): void {
    // Gestion des valeurs null
    if (value === null) {
      base[key] = null;
      return;
    }

    // Gestion des tableaux de relations
    if (Array.isArray(value)) {
      base[key] = value.map(item => 
        useUpsert
          ? { upsert: this.createUpsertPayload(mapper, item) }
          : isUpdate
          ? { update: mapper.toPrismaUpdate(item) }
          : { create: mapper.toPrismaCreate(item) }
      );
      return;
    }

    // Relation simple (objet)
    if (useUpsert) {
      base[key] = { upsert: this.createUpsertPayload(mapper, value) };
    } else if (isUpdate) {
      base[key] = { update: mapper.toPrismaUpdate(value) };
    } else {
      base[key] = { create: mapper.toPrismaCreate(value) };
    }
  }

  private createUpsertPayload(
    mapper: NestedRelationMapper<any, any, any>,
    value: unknown
  ): { create: unknown; update: unknown } {
    return {
      create: mapper.toPrismaCreate(value),
      update: mapper.toPrismaUpdate(value)
    };
  }

  // Méthode utilitaire pour la création
  toPrismaCreate(data: TDomain, nestedUpsert: (keyof TNested)[] = []): TCreatePrisma {
    return this.toPrisma(data, false, nestedUpsert) as TCreatePrisma;
  }

  // Méthode utilitaire pour la mise à jour
  toPrismaUpdate(data: TDomain, nestedUpsert: (keyof TNested)[] = []): TUpdatePrisma {
    if (!data.id) {
      throw new Error("id is required for update");
    }
    return this.toPrisma(data, true, nestedUpsert) as TUpdatePrisma;
  }
} */