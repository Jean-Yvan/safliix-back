import { VideoCategory, VideoMetadata } from "@safliix-back/contents";
import { Season } from "./season.entity";
import { CreateSerieDto } from "../../interfaces/create-serie.dto";
import { Result,Err,Ok } from "oxide.ts";

export class Serie {
  private seasons: Season[] = [];
  
  constructor(
    public readonly id: string | null,
    public metadata: VideoMetadata,
    public rentalPrice: number | null,
    public seasonCount: number,
    public type: string,
    public status: string
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
    const category = VideoCategory.create(undefined,data.category,null);
    if (category.isErr()) {
      return Err(category.unwrapErr());
    }
    const metadata = VideoMetadata.create(
      null,
      data.title,
      data.description ?? '',
      data.thumbnailUrl,
      data.productionHouse,
      data.director,
      data.secondaryImageUrl ?? null,
      new Date(data.releaseDate),
      new Date(data.plateformDate),
      category.unwrap()
    );

    if (metadata.isErr()) {
      return Err(metadata.unwrapErr());
    }

    // Removed stray if statement to fix block error
    const serie = new Serie(
      null, 
      metadata.unwrap(),
      data.rentalPrice ?? null,
      data.seasonCount,
      data.type,
      data.status
    );

    return Ok(serie);
    
  }
}
