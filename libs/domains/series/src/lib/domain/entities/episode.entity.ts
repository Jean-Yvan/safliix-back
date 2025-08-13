import { VideoFile, VideoMetadata } from "@safliix-back/contents";
import { Err,Ok, Result } from "oxide.ts";
import { AddEpisodeDto } from "../../interfaces/add-episode.dto";

export class Episode{
	constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly seasonId: string,
    public readonly number: number,
    public readonly videoFile: VideoFile,
    public readonly metadata?: VideoMetadata,
    
  ) {}

  validate(): boolean {
    if (!this.title || !this.seasonId || this.number < 1 ) {
      throw new Error('Invalid episode data');
    }
    return true;
  }

  static create(data : AddEpisodeDto,episodeNumber: number): Result<Episode, Error> {
    try {
      const videoFile = VideoFile.create({
        duration : data.duration,
        filePath: data.videoFileUrl
      });
      if (videoFile.isErr()) {
        return Err(videoFile.unwrapErr());
      }

      const metadata = VideoMetadata.create({
        title: data.title,
        description: data.description ? data.description : '',
        releaseDate: new Date(data.realeaseDate),
        platformDate: new Date(data.plateformDate),
        director: data.director,
        thumbnailUrl: "",
        duration: 0,
        productionHouse: "",
        secondaryImage: null,
        format: undefined,
        category: undefined
      });

      if (metadata.isErr()) {
        return Err(metadata.unwrapErr());
      }

      const episode = new Episode(
        '',
        data.title,
        data.seasonId,
        episodeNumber,
        videoFile.unwrap(),
        metadata.unwrap()
      );

      episode.validate();
      return Ok(episode);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Episode creation failed'));
    }
  }

  
}