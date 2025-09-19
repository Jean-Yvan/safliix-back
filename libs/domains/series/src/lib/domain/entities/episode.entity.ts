
import { Err,Ok, Result } from "oxide.ts";
import { AddEpisodeDto } from "../../interfaces/add-episode.dto";
import { EpisodeWithRelations } from "@safliix-back/database";
import { UpdateEpisodeDto } from "src/lib/interfaces/update-episode.dto";
import { VideoAttachment } from "@safliix-back/video";

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
    public attachment: VideoAttachment[],
    
    
  ) {}

  validate(): boolean {
    if (!this.title || !this.seasonId || this.number < 1 ) {
      throw new Error('Invalid episode data');
    }
    return true;
  }

  static create(data : AddEpisodeDto): Result<Episode, Error> {
    
    

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
      []
      
    );
    try{
      episode.validate();
    }catch(e){
      return Err(e as Error);
    }  
      
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
      data.videoAttachment.map(va => VideoAttachment.restore(va))
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