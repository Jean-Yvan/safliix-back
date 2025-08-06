import { Episode } from "./episode.entity";

export class Season {
  private episodes: Episode[] = [];

  constructor(
    public readonly id: string,
    public title: string,
    public readonly number: number
  ) {}

  addEpisode(episode: Episode) {
    if (this.episodes.some(e => e.number === episode.number)) {
      throw new Error(episode.number.toString());
    }
    this.episodes.push(episode);
  }
}