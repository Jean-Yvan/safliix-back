// libs/database/src/lib/prisma-types.ts
import { Prisma, ContentStatus, MediaAttachmentType, MediaFileStatus, MediaType } from "../generated/client";
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
  sharedAccountInclude,
  adminInclude,
  attachmentInclude,
  adInclude,
  adViewInclude,
} from "./prisma-includes";

export type MetadataWithRelations = Prisma.VideoMetadataGetPayload<{
  include: typeof metadataInclude;
}>;

export type VideoFormatWithoutRelation = Prisma.VideoFormatGetPayload<object>
export type VideoCategoryWithoutRelation = Prisma.VideoCategoryGetPayload<object>;
export type MediaFileWithoutRelation = Prisma.MediaFileGetPayload<object>;
export type ActiveStreamWithoutRelation = Prisma.ActiveStreamGetPayload<object>;
export type VideoGenderWithoutRelation = Prisma.VideoGenreGetPayload<object>;

export type MovieWithRelations = Prisma.MovieGetPayload<{
  include: typeof movieInclude}>;

export type EpisodeWithRelations = Prisma.EpisodeGetPayload<{
  include: typeof episodeInclude;
}>;

export type SeasonWithRelations = Prisma.SeasonGetPayload<{
  include: typeof seasonInclude;
}>;


export type SerieWithRelations = Prisma.SerieGetPayload<{
  include: typeof serieInclude;
}>;

export type SerieWithMetadataAndSeasonCount = Prisma.SerieGetPayload<{
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
}>;



export type SubscriptionWithRelation = Prisma.SubscriptionGetPayload<{
  include: {
    user: true,
    plan: true
  }
}>

export type PurchaseWithRelation = Prisma.PurchaseGetPayload<{
  include: {
    user:true,
    movie:true
  }
}>;

export type AdminWithRelation = Prisma.AdminGetPayload<{
  include: typeof adminInclude;
}>;

export type MediaAttachmentWithRelation = Prisma.MediaAttachmentGetPayload<{
  include: typeof attachmentInclude;
}>;

export type AdWithRelation = Prisma.AdGetPayload<{
  include: typeof adInclude;
}>;

export type AdViewWithRelation = Prisma.AdViewGetPayload<{
  include: typeof adViewInclude;
}>;

export type UserVideoViewWithRelation = Prisma.UserVideoViewGetPayload<{
  include: {
    user: true;
  };
}>;






// 👇 utilitaire générique pour les "create"
export type CreateToPrisma<TModelName extends keyof Prisma.TypeMap["model"]> =
  Prisma.TypeMap["model"][TModelName]["operations"]["create"]["args"]["data"];

// 👇 utilitaire générique pour les "update"
export type UpdateToPrisma<TModelName extends keyof Prisma.TypeMap["model"]> = {
  where: { id: string };
  data: Prisma.TypeMap["model"][TModelName]["operations"]["update"]["args"]["data"];
};

export { ContentStatus, MediaAttachmentType, MediaFileStatus, MediaType };
