import { VideoCategory, VideoFormat, VideoMetadata } from "@safliix-back/contents";
import { Season } from "./season.entity";
import { CreateSerieDto } from "../../interfaces/create-serie.dto";
import { Result,Err,Ok } from "oxide.ts";

export class Serie {
  private seasons: Season[] = [];

  constructor(
    public readonly id: string,
    public metadata: VideoMetadata,
    public isPremiere = false,
  ) {}

  addSeason(season: Season) {
    if (this.seasons.some(s => s.number === season.number)) {
      throw new Error(`Season ${season.number} already exists for serie ${this.metadata.title}`);
    }
    this.seasons.push(season);
  }

  getSeasons(): Season[] {
    return [...this.seasons]; // copie pour éviter la modification externe
  }

  static create(data: CreateSerieDto): Result<Serie, Error> {
    try {

      const format = VideoFormat.create(data.format);
      if (format.isErr()) {
        return Err(format.unwrapErr());
      }

      const category = VideoCategory.create(data.category);
      if (category.isErr()) {
        return Err(category.unwrapErr());
      }
      const metadata = VideoMetadata.create({
        title: data.title,
        description: data.description ?? '',
        releaseDate: new Date(data.releaseDate),
        platformDate: new Date(data.plateformDate),
        director: data.director,
        thumbnailUrl: data.thumbnailUrl,
        duration: data.duration,
        productionHouse: data.productionHouse,
        secondaryImage: data.secondaryImageUrl ?? null,
        format: format.unwrap(),
        category: category.unwrap()
      });

      if (metadata.isErr()) {
        return Err(metadata.unwrapErr());
      }

      const serie = new Serie('', metadata.unwrap(),data.isPremiere);

      return Ok(serie);
    } catch (error) {
      return Err(new Error(`Failed to create Serie: ${error}`));
    }
  }
}
