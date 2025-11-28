import { Module } from '@nestjs/common';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { CqrsModule } from '@nestjs/cqrs';
import {
  AddReviewHandler,
  GetContentHandler,
  GetEpisodesHandler,
  GetRecommendationsHandler,
  GetReviewsHandler,
  ListCatalogSectionsHandler,
  SearchCatalogHandler,
  ToggleFavoriteHandler,
} from './handlers';

@Module({
  imports: [SafliixBackDatabaseModule, CqrsModule],
  controllers: [],
  providers: [
    ...[
      ListCatalogSectionsHandler,
      SearchCatalogHandler,
      GetContentHandler,
      GetEpisodesHandler,
      GetRecommendationsHandler,
      GetReviewsHandler,
      AddReviewHandler,
      ToggleFavoriteHandler,
      GetPlaybackHandler,
      ListFavoritesHandler,
      CreateFavoriteHandler,
      DeleteFavoriteHandler,
    ],
  ],
  exports: [
    ...[
      ListCatalogSectionsHandler,
      SearchCatalogHandler,
      GetContentHandler,
      GetEpisodesHandler,
      GetRecommendationsHandler,
      GetReviewsHandler,
      AddReviewHandler,
      ToggleFavoriteHandler,
      GetPlaybackHandler,
      ListFavoritesHandler,
      CreateFavoriteHandler,
      DeleteFavoriteHandler,
    ],
  ],
})
export class SafliixBackContentsModule {}
