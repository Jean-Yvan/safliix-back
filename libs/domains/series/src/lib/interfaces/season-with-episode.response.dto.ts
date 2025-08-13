import { ApiProperty } from "@nestjs/swagger";
import { Season } from "../domain/entities/season.entity";

export class EpisodeDto {
  @ApiProperty({ 
    example: 'a1b2c3d4',
    description: 'ID unique de l\'épisode' 
  })
  id!: string;

  @ApiProperty({ 
    example: 1,
    description: 'Numéro de l\'épisode dans la saison' 
  })
  episodeNumber!: number;

  @ApiProperty({ 
    example: 'Pilot',
    description: 'Titre de l\'épisode' 
  })
  title!: string;

  @ApiProperty({ 
    example: 'Walter White découvre son cancer...',
    description: 'Résumé de l\'épisode' 
  })
  description!: string;

  @ApiProperty({ 
    example: '2018-01-20T00:00:00.000Z',
    description: 'Date de première diffusion' 
  })
  airDate!: Date;

  @ApiProperty({ 
    example: 42,
    description: 'Durée en minutes' 
  })
  duration!: number;

  @ApiProperty({ 
    example: 'https://example.com/thumbnails/ep1.jpg',
    description: 'URL de la miniature' 
  })
  thumbnailUrl!: string;

  
  @ApiProperty({ 
    example: false,
    description: 'Est-ce un épisode gratuit/preview ?' 
  })
  isFree?: boolean;
}


export class SeasonWithEpisodesDto {
  @ApiProperty({ 
    example: 's1a2b3c4',
    description: 'ID unique de la saison' 
  })
  id!: string;

  @ApiProperty({ 
    example: 1,
    description: 'Numéro de la saison' 
  })
  seasonNumber!: number;

  @ApiProperty({ 
    example: 'Saison 1',
    description: 'Titre de la saison',
    required: false 
  })
  title?: string;

  @ApiProperty({ 
    example: 'https://example.com/thumbnails/season1.jpg',
    description: 'URL de la miniature de la saison' 
  })
  thumbnailUrl!: string;

  @ApiProperty({ 
    example: '2008',
    description: 'Année de sortie de la saison' 
  })
  year!: string;

  @ApiProperty({ 
    type: [EpisodeDto],
    description: 'Liste des épisodes de la saison' 
  })
  episodes!: EpisodeDto[];

  @ApiProperty({ 
    example: 8.9,
    description: 'Note moyenne de la saison',
    required: false 
  })
  rating?: number;

  constructor(season: Season) {
    this.id = season.id;
    this.seasonNumber = season.number;
    this.title = season.title;
    //this.thumbnailUrl = season.thumbnailUrl; // Assuming Season has a thumbnailUrl property
    this.year = new Date().getFullYear().toString(); // Placeholder, should be set properly
    this.episodes = season.episodes.map(episode => ({
      id: episode.id,
      episodeNumber: episode.number,
      title: episode.title,
      description: episode.metadata?.description ?? '',
      airDate: episode.metadata?.releaseDate ?? new Date(),
      duration: episode.metadata?.duration ?? 0,
      thumbnailUrl: episode.metadata?.thumbnail ?? '',
    }));
  }
}