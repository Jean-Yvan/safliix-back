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

export const sessionInclude = {
  
    user:true
  
} as const;

// Type sans relations incluses
export const userWithoutRelationsSelect = {
  id: true,
  email: true,
  password_hash: true,
  name: true,
  avatarUrl: true,
  lastLoginAt: true,
  isVerified: true,
  isMainAccount: true,
  createdAt: true,
  updatedAt: true,
  
} as const;

// Type avec relations incluses
export const userWithRelationsInclude = {
  sessions: true,
  subscriptions: true,
  ownedSharedAccounts: true,
  sharedProfiles: true,
  purchases: true,
  comments: true,
  sharedAccount: true,
  adViews: true,
  userVideoView: true,
  seasonView: true,
  emailValidation: true
} as const;

export const sharedAccountUserInclude = {
 sharedAccount:true 
} as const;

export const sharedAccountInclude = {
  owner:true,
  subscription:true,
  profiles:true
} as const;

export const purchaseInclude = {
  user:true,
  video:true
} as const;

export const adminInclude = {
  sessions: true,
  emailValidation: true
} as const;