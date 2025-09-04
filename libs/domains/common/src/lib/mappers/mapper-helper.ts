
export function mapOptional<T>(value: T | undefined): T | undefined {
  return value ?? undefined;
}


export function mapOne<TDomain, TPrisma>(
  entity: TDomain | undefined,
  mapper: (e: TDomain) => TPrisma
): TPrisma | undefined {
  return entity ? mapper(entity) : undefined;
}

// ✅ Utilitaire pour One-to-Many relation
export function mapMany<TDomain, TPrisma>(
  entities: TDomain[] | undefined,
  mapper: (e: TDomain) => TPrisma
): TPrisma[] | undefined {
  return entities?.map(mapper);
}

// ✅ Utilitaire pour Prisma nested create/update (One-to-One)
export function mapNestedOne<TDomain, TCreate, TUpdate>(
  entity: TDomain | undefined,
  toCreate: (e: TDomain) => TCreate,
  toUpdate: (e: TDomain) => TUpdate,
  isUpdate: boolean
): { create?: TCreate; update?: TUpdate } | undefined {
  if (!entity) return undefined;
  return isUpdate ? { update: toUpdate(entity) } : { create: toCreate(entity) };
}

// ✅ Utilitaire pour Prisma nested create/update (One-to-Many)
export function mapNestedMany<TDomain, TCreate, TUpdate>(
  entities: TDomain[] | undefined,
  toCreate: (e: TDomain) => TCreate,
  toUpdate: (e: TDomain) => TUpdate,
  isUpdate: boolean
): { create?: TCreate[]; update?: TUpdate[] } | undefined {
  if (!entities) return undefined;
  return isUpdate
    ? { update: entities.map(toUpdate) }
    : { create: entities.map(toCreate) };
}

// common/mappers/mapper-helpers.ts

// ✅ Utilitaire pour relation par connect (One-to-One)
export function mapConnect(
  id: string
): { connect: { id: string } }  {
  return { connect: { id } }; 
}

// ✅ Utilitaire pour relation par connectOrCreate (One-to-One)
export function mapConnectOrCreate<TDomain, TCreate>(
  entity: TDomain | undefined,
  uniqueField: keyof TCreate, // ex: "email"
  toCreate: (e: TDomain) => TCreate
): { connectOrCreate: { where: Record<string, unknown>; create: TCreate } } | undefined {
  if (!entity) return undefined;

  const createPayload = toCreate(entity);

  return {
    connectOrCreate: {
      where: { [uniqueField]: (createPayload as TCreate)[uniqueField] },
      create: createPayload,
    },
  };
}

// mapper-helpers.ts
export const mapField = <T>(value: T | null | undefined, mapper?: (v: T) => any) =>
  value !== null && value !== undefined
    ? mapper
      ? mapper(value)
      : value
    : undefined;


