// libs/database/src/lib/prisma-includes.ts

export const metadataInclude = {
  format: true,
  category: true,
  actors: {
    include: {
      actor: true,
    },
  },
} as const;

export const episodeInclude = {
  videoFile: true,
  metadata: {
    include: metadataInclude,
  },
} as const;

export const seasonInclude = {
  episodes: {
    include: episodeInclude,
  },
} as const;

export const serieInclude = {
  metadata: {
    include: metadataInclude,
  },
  seasons: {
    include: seasonInclude,
  },
} as const;

export const movieInclude = {
  metadata: {
    include: metadataInclude,
  },
  videoFile: true,
} as const;

export const serieWithMetadataAndSeasonCountInclude = {
  metadata: {
    include: metadataInclude,
  },
  _count: {
    select: { seasons: true },
  },
} as const;