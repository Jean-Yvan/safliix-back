import { Serie } from '../entities/serie.entity';
import { Episode } from '../entities/episode.entity';
import { Season } from '../entities/season.entity';

export interface SerieFilter {
  q?: string;
  category?: string;
  genre?: string;
}

export interface ISerieRepository {
  // CRUD Series
  findById(id: string): Promise<Serie | null>;
  findAll(filters?: SerieFilter): Promise<Serie[]>;
  save(serie: Serie): Promise<void>;
  update(serie: Serie): Promise<Serie>;
  deleteById(id: string): Promise<void>;

  // Relations
  findSeasonsBySerieId(serieId: string): Promise<Season[]>;
  findEpisodesBySeasonId(seasonId: string): Promise<Episode[]>;
  findEpisodeById(episodeId:string):Promise<Episode | null>;
  findSeasonById(seasonId:string):Promise<Season | null>;
  // Helpers
  countSeasons(serieId: string): Promise<number>;
  countEpisodes(serieId: string): Promise<number>;

  // Nouveaux : gestion des saisons & épisodes
  createSeason(season: Season): Promise<Season>;
  updateSeason(season: Season): Promise<Season>;
  deleteSeason(seasonId: string): Promise<void>;

  createEpisode(episode: Episode): Promise<Episode>;
  updateEpisode(episode: Episode): Promise<Episode>;
  deleteEpisode(episodeId: string): Promise<void>;

  moveEpisode(episodeId: string, toSeasonId: string): Promise<void>;
}
