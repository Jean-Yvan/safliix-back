// libs/database/src/lib/prisma-types.ts
import { Prisma } from "../generated/client";
import {
  metadataInclude,
  episodeInclude,
  seasonInclude,
  serieInclude,
  serieWithMetadataAndSeasonCountInclude,
  movieInclude
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

export type SerieToPrisma = {
  id: string | undefined;
  metadata: {
    create: MetadataToPrisma;
  };
  rentalPrice?: number | null;
  status: string;
  type: string;
  seasonCount: number
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
};


export type SeasonToPrisma = {
  id: string | undefined; // optional if Prisma should generate the id
  number: number;
  serieId: string;
  title: string | undefined;
  episodes?: { create: EpisodeToPrisma[] };
};

export type VideoFileToPrisma = {
  id: string | undefined; // optional if Prisma should generate the id
  filePath: string;
  duration: number;
  trailerPath: string | null;
  width: number | null;
  height: number | null;
};

export type VideoCategoryToPrisma = {
  id: string | undefined; // optional if Prisma should generate the id
  category: string;
  description: string | null;
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
};



export type SerieViewToPrisma = {
  id: string;
  seriesId: string;
  userId: string;
  viewAt: Date;
  seasonWatched: number;
  episodeWatched: number;
  totalTimeSpent: number;
  rating: number; // in seconds
  
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
  startedAt: Date;
  endedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;

}

export type SeasonViewToPrisma = {
  id: string | undefined;
  seasonId: string;
  userId: string;
  viewAt: Date;
  episodesWatched: number;
  totalTimeSpent: number; // in seconds
  rating: number; // in seconds
};