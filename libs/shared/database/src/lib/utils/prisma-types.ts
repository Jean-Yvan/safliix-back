// libs/database/src/lib/prisma-types.ts
import { Prisma,SubscriptionPlan } from "../generated/client";
import {
  metadataInclude,
  episodeInclude,
  seasonInclude,
  serieInclude,
  serieWithMetadataAndSeasonCountInclude,
  movieInclude,
  sessionInclude,
  userWithRelationsInclude,
  userWithoutRelationsSelect,
  sharedAccountUserInclude,
  sharedAccountInclude
} from "./prisma-includes";

export type MetadataWithRelations = Prisma.VideoMetadataGetPayload<{
  include: typeof metadataInclude;
}>;

export type MovieWithRelations = Prisma.MovieGetPayload<{
  include: typeof movieInclude}>;

export type EpisodeWithRelations = Prisma.EpisodeGetPayload<{
  include: typeof episodeInclude;
}>;

export type SeasonWithRelations = Prisma.SeasonGetPayload<{
  include: typeof seasonInclude;
}>;


export type SerieWithRelations = Prisma.SeriesGetPayload<{
  include: typeof serieInclude;
}>;

export type SerieWithMetadataAndSeasonCount = Prisma.SeriesGetPayload<{
  include: typeof serieWithMetadataAndSeasonCountInclude;
}>;

export type SessionWithUser = Prisma.SessionGetPayload<{
  include: typeof sessionInclude; 
}>;

export type UserWithoutRelation = Prisma.UserGetPayload<{
  select : typeof userWithoutRelationsSelect;
}>;

export type UserWithRelation = Prisma.UserGetPayload<{
  include: typeof userWithRelationsInclude;
}>;

export type SharedAccountUserWithRelation = Prisma.SharedAccountUserGetPayload<{
  include : typeof sharedAccountUserInclude;
}>;

export type SharedAccountWithRelation = Prisma.SharedAccountGetPayload<{
  include: typeof sharedAccountInclude;
}>

export type SubscriptionPlanWithRelation = Prisma.SubscriptionPlanGetPayload<{
  include: {
    subscriptions:true
  }
}>

export type SubscriptionWithRelation = Prisma.SubscriptionGetPayload<{
  include: {
    user: true,
    plan: true
  }
}>

export type PurchaseWithRelation = Prisma.PurchaseGetPayload<{
  include: {
    user:true,
    video:true
  }
}>;

/* export type SubscriptionPlan = Prisma.SubscriptionPlanGetPayload<{
  include:{
    subscriptions:false
  }
}> */

export type SerieToPrisma = {
  id: string | undefined;
  metadata: {
    create: MetadataToPrisma;
  };
  rentalPrice?: number | null;
  status: string;
  type: string;
  seasonCount: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type MovieToPrisma = {
  id: string | undefined; // optional if Prisma should generate the id
  metadata: {
    create: MetadataToPrisma;
  };
  videoFile: {
    create: VideoFileToPrisma;
  };
  rentalPrice?: number | null;
  status: string;
  type: string;

  createdAt?: Date;
  updatedAt?: Date;
};

export type EpisodeToPrisma = {
  number: number;
  title?: string;
  season: { connect: { id: string } };
  metadata: {
    create: MetadataToPrisma;
  };
  videoFile: {
    create: VideoFileToPrisma;
  };

  createdAt?: Date;
  updatedAt?: Date;
};


export type SeasonToPrisma = {
  id: string | undefined; // optional if Prisma should generate the id
  number: number;
  serieId: string;
  title: string | undefined;
  episodes?: { create: EpisodeToPrisma[] };

  createdAt?: Date;
  updatedAt?: Date;
};

export type VideoFileToPrisma = {
  id: string | undefined; // optional if Prisma should generate the id
  filePath: string;
  duration: number;
  trailerPath: string | null;
  width: number | null;
  height: number | null;

  createdAt?: Date;
  updatedAt?: Date;
};

export type VideoCategoryToPrisma = {
  id: string | undefined; // optional if Prisma should generate the id
  category: string;
  description: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type VideoFormatToPrisma = {
  id: string | undefined;       // optionnel si Prisma doit générer l'id
  format: string;
  description: string | null; // peut être null si pas de description
};

export type VideoActorToPrisma = {
  id: string | undefined;       // optionnel
  name: string;
  bio: string | null;
  dateOfBirth: Date | null; // peut être null si pas de date de naissance
  createdAt?: Date;
  updatedAt?: Date;
};



export type MetadataToPrisma = {
  id: string | undefined; // optionnel si on veut laisser Prisma générer l'id
  title: string;
  description: string;
  thumbnailUrl: string;
  secondaryImage: string;
  releaseDate: Date;
  platformDate: Date;
  ageRating: string;
  productionHouse: string;
  productionCountry: string;
  director: string;
  status: string;
  format: {
    connectOrCreate: {
      where: { format : string };
      create: VideoFormatToPrisma;
    };
  };
  category: {
    connectOrCreate: {
      where: { category: string };
      create: VideoCategoryToPrisma;
    };
  };
  actors: {
    create: {
      actor: {
        connectOrCreate: {
          where: { id: string };
          create: VideoActorToPrisma;
        };
      };
    }[];
  };

  createdAt?: Date;
  updatedAt?: Date;
};



export type SerieViewToPrisma = {
  id: string | undefined;
  seriesId: string;
  userId: string;
  viewedAt: Date;
  seasonsWatched: number | null;
  episodesWatched: number | null;
  totalTimeSpent: number | null;
  rating: number | null; // in seconds
  
  createdAt?: Date;
  updatedAt?: Date;
};


export type UserVideoViewToPrisma = {
  id: string | undefined;
  userId: string;
  profileId: string | null;
  videoId: string;
  progress: number;
  completed: boolean;
  country: string | null;
  device: string | null;
  rating: number | null; // note ou appréciation de l’utilisateur
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;

}

export type SeasonViewToPrisma = {
  id: string | undefined;
  seasonId: string;
  userId: string;
  viewedAt: Date;
  episodesWatched: number | null;
  totalTimeSpent: number | null; // in seconds
  rating: number | null; // in seconds
  createdAt?: Date;
  updatedAt?: Date;
};



export type UserToPrisma = {
  id: string | undefined;
  email: string;
  password_hash: string;
  name: string | null;
  avatarUrl: string | null;
  lastLoginAt: Date | null;
  isVerified: boolean;
  isMainAccount: boolean;
  role: string; // UserRole
  createdAt?: Date;
  updatedAt?: Date;
};

export type SessionToPrisma = {
  id: string | undefined;
  user:{
    connect: {
      id: string
    }
  };
  refreshToken: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type EmailValidationToPrisma = {
  id: string | undefined;
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SharedAccountToPrisma = {
  id: string | undefined;
  owner:{
    connect:{
      id:string;
    }
  };
  subscription:{
    connect:{
      id:string;
    }
  };
  status: string; // SharedAccountStatus
  createdAt?: Date;
  updatedAt?: Date;
};

export type SharedAccountUserToPrisma = {
  id: string | undefined;
  sharedAccount: {
    connect:{
      id:string;
    }
  };
  profileName: string;
  isKidProfile:boolean;
  avatarUrl: string | null;
  pinCode:number;
  createdAt?: Date;
  updatedAt?:Date 

}

export type CreateSubscriptionPlanInput = Omit<SubscriptionPlan, "id">;

// 👇 utilitaire générique pour les "create"
export type CreateToPrisma<TModelName extends keyof Prisma.TypeMap["model"]> =
  Prisma.TypeMap["model"][TModelName]["operations"]["create"]["args"]["data"];

// 👇 utilitaire générique pour les "update"
export type UpdateToPrisma<TModelName extends keyof Prisma.TypeMap["model"]> = {
  where: { id: string };
  data: Prisma.TypeMap["model"][TModelName]["operations"]["update"]["args"]["data"];
};


