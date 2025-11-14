import { VideoCategory, VideoGender, VideoMetadata, VideoMetadataMapper } from "@safliix-back/contents";
import { Season } from "./season.entity";
import { CreateSerieDto } from "../../interfaces/create-serie.dto";
import { UpdateSerieDto } from "../../interfaces/update-serie.dto";
import { Result, Err, Ok } from "oxide.ts";
import { SerieWithMetadataAndSeasonCount, SerieWithRelations } from "@safliix-back/database";
import { MediaAttachment } from "@safliix-back/video";
import { ContentStatus } from "@safliix-back/common";

export class Serie {
  private seasons: Season[] = [];
  
  constructor(
    public readonly id: string | null,
    public metadata: VideoMetadata,
    public rentalPrice: number | null,
    public seasonCount: number,
    public type: string,
    public attachment: MediaAttachment[]
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

    const gender = VideoGender.create({name:data.gender});
    if(gender.isErr()){
      return Err(gender.unwrapErr());
    }
    const metadata = VideoMetadata.create({
      id: undefined,
      title: data.title,
      description: data.description ?? '',
      thumbnailUrl: data.thumbnailUrl,
      secondaryImage: data.secondaryImageUrl ?? null,
      productionHouse: data.productionHouse,
      productionCountry: data.productionCountry,
      status: data.status ?? ContentStatus.DRAFT,
      director: data.director,
      releaseDate: new Date(data.releaseDate),
      platformDate: new Date(data.plateformDate),
      category: category.unwrap(),
      format: null,
      gender: gender.unwrap(),
      actors: data.actors
    });

    if (metadata.isErr()) {
      console.log("code:l'erreur vient d'ici");
      return Err(metadata.unwrapErr());
    }

    // Removed stray if statement to fix block error
    const serie = new Serie(
      null, 
      metadata.unwrap(),
      data.rentalPrice ?? null,
      data.seasonCount,
      data.type,
      []
    );

    return Ok(serie);
    
  }

  static restore(data: SerieWithRelations | SerieWithMetadataAndSeasonCount) : Serie {
    return new Serie(
      data.id,
      VideoMetadataMapper.toDomain(data.metadata),
      data.rentalPrice,
      data.seasonCount,
      data.type,
      data.attachment.map(va => MediaAttachment.restore(va))
    )
  }

  updateWith(data: UpdateSerieDto): Result<Serie,Error> {
  // Mise à jour du prix de location
    if (data.rentalPrice !== undefined) {
      this.rentalPrice = data.rentalPrice;
    }

    // Mise à jour du nombre de saisons
    if (data.seasonCount !== undefined) {
      this.seasonCount = data.seasonCount;
    }

    // Mise à jour du type
    if (data.type !== undefined) {
      this.type = data.type;
    }

  

    const categoryResult = data.category ? this.metadata.category.updateWith({category:data.category}) : null;
    if(categoryResult && categoryResult.isErr()){
      return Err(categoryResult.unwrapErr());
    }

    const gender = data.gender ? this.metadata.gender.updateWith(data.gender) : this.metadata.gender;
    const category = categoryResult?.unwrap() ?? this.metadata.category;
    
    // Mise à jour des métadonnées (grâce à une méthode de VideoMetadata)
    this.metadata.updateWith({
      title: data.title ?? this.metadata.title,
      description: data.description ?? this.metadata.description,
      thumbnailUrl: data.thumbnailUrl ?? this.metadata.thumbnailUrl,
      secondaryImage: data.secondaryImageUrl ?? this.metadata.secondaryImage,
      productionHouse: data.productionHouse ?? this.metadata.productionHouse,
      productionCountry: data.productionCountry ?? this.metadata.productionCountry,
      director: data.director ?? this.metadata.director,
      status: data.status ?? this.metadata.status,
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : this.metadata.releaseDate,
      platformDate: data.plateformDate ? new Date(data.plateformDate) : this.metadata.platformDate,
      category: category,
      gender: gender,
    });

    return Ok(this);
  }

}
