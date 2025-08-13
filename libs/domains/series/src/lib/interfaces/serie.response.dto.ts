import { ApiProperty } from "@nestjs/swagger";
import { Serie } from "../domain/entities/serie.entity";


export class SeasonSummaryDto {
  @ApiProperty({
    example: 'a1b2c3d4',
    description: 'Unique identifier of the season'
  })
  id!: string;

  @ApiProperty({ example: 1, description: 'Season number' })
  number!: number;

  @ApiProperty({
    example: 'Season 1',
    description: 'Title of the season'
  })
  title?: string;

  @ApiProperty({
    example: 10,
    description: 'Number of episodes in the season'
  })
  episodeCount!: number;
}

export class SerieResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4',
    description: 'Unique identifier of the series'
  })
  id: string;

  @ApiProperty({
    example: 'Breaking Bad',
    description: 'Title of the series'
  })
  title: string;

  @ApiProperty({
    example: 'A high school chemistry teacher diagnosed with cancer...',
    description: 'Detailed description of the series'
  })
  description: string;

  @ApiProperty({
    example: '2018-01-01T00:00:00.000Z',
    description: 'Original release date'
  })
  releaseDate: Date;

  @ApiProperty({
    example: '2020-05-01T00:00:00.000Z',
    description: 'Date when the series became available on the platform',
    required: false
  })
  platformDate?: Date;

  @ApiProperty({
    description: 'Age rating classification'
  })
  ageRating!: string;

  

  @ApiProperty({
    type: [SeasonSummaryDto],
    description: 'List of seasons with basic information'
  })
  seasons: SeasonSummaryDto[];
  
  @ApiProperty({
    example: 'https://image.tmdb.org/t/p/original/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    description: 'URL of the main thumbnail image'
  })
  thumbnailUrl: string;

  @ApiProperty({
    example: false,
    description: 'Whether the series is a platform exclusive premiere'
  })
  isPremiere: boolean;

  
  @ApiProperty({
    example: 9.5,
    description: 'Average user rating (0-10 scale)',
    required: false
  })
  rating?: number;

  constructor(serie: Serie) {
    this.id = serie.id;
    this.title = serie.metadata.title;
    this.description = serie.metadata.description;
    this.releaseDate = serie.metadata.releaseDate;
    this.platformDate = serie.metadata.platformDate;
    this.thumbnailUrl = serie.metadata.thumbnail;
    this.isPremiere = serie.isPremiere;
    //this.maxVideoQuality = this.calculateMaxQuality(serie);
    this.seasons = serie.getSeasons().map(season => ({
      id: season.id,
      number: season.number,
      title: season.title,
      episodeCount: season.episodes.length
    }));
  }

  
}