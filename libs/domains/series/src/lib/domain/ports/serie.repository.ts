import { Serie } from '../entities/serie.entity';
import { Episode } from '../entities/episode.entity';
import { Season } from '../entities/season.entity';

export interface ISerieRepository {
  findById(id: string): Promise<Serie | null>;
  findAll(): Promise<Serie[] | null>;
  save(serie: Serie): Promise<Serie>;
  deleteById(id: string): Promise<void>;
  update(serie: Serie): Promise<void>;
  addEpisodeToSerie(serieId: string, episodeId: string): Promise<void>;
  removeEpisodeFromSerie(serieId: string, episodeId: string): Promise<void>;
  findEpisodesBySerieId(serieId: string): Promise<Episode[]>;
  findEpisodeBySeasonId(seasonId: string): Promise<Episode[] | null>;
  findSeasonsBySerieId(serieId: string): Promise<Season[]>;
  addSeasonToSerie(serieId: string, seasonId: string): Promise<void>;
  removeSeasonFromSerie(serieId: string, seasonId: string): Promise<void>;
  
} 