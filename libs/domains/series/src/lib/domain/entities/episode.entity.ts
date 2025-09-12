import { VideoFile, VideoFileMapper } from "@safliix-back/contents";
import { Err,Ok, Result } from "oxide.ts";
import { AddEpisodeDto } from "../../interfaces/add-episode.dto";
import { EpisodeWithRelations } from "@safliix-back/database";
import { UpdateEpisodeDto } from "src/lib/interfaces/update-episode.dto";

export class Episode{
	constructor(
    public id: string | undefined,
    public title: string | null,
    public releaseDate: Date,
    public plateformDate: Date,
    public director: string,
    public description:string | null,
    public isSaFliixProd: boolean,
    public seasonId: string,
    public number: number,
    public readonly videoFile: VideoFile,
    
    
  ) {}

  validate(): boolean {
    if (!this.title || !this.seasonId || this.number < 1 ) {
      throw new Error('Invalid episode data');
    }
    return true;
  }

  static create(data : AddEpisodeDto): Result<Episode, Error> {
    
    const videoFile = VideoFile.create(
      undefined,
      data.videoFileUrl,
      data.duration,
      data.thrailerPath,
      0,
      0
    );
    if (videoFile.isErr()) {
      return Err(videoFile.unwrapErr());
    }

    const episode = new Episode(
      undefined,  
      data.title,
      new Date(data.releaseDate),
      new Date(data.plateformDate),
      data.director,
      data.description ?? null,
      data.isCustomProduction,
      data.seasonId,
      data.episodeNumber,
      videoFile.unwrap(),
      
    );

    episode.validate();
    return Ok(episode);
    
  }

  static restore(data: EpisodeWithRelations): Episode {
    return new Episode(
      data.id,
      data.title,
      data.releaseDate,
      data.plateformeDAte,
      data.director,
      data.description,
      data.isSaFliixProd,
      data.seasonId,
      data.number,
      VideoFileMapper.toDomain( data.videoFile)
    )
  }

  updateWith(data:UpdateEpisodeDto){
    this.id = data.id;
    this.title = data.title ? data.title : this.title;
    this.description = data.description ? data.description : this.description;
    this.director = data.director ? data.director : this.director;
    this.number = data.episodeNumber ? data.episodeNumber : this.number;
    this.seasonId = data.seasonId ? data.seasonId : this.seasonId;
    this.releaseDate = data.releaseDate ? new Date(data.releaseDate) : this.releaseDate;
    this.plateformDate = data.plateformDate ? new Date(data.plateformDate) : this.plateformDate;

  }

  
}