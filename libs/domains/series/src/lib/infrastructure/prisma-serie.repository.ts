import { Injectable } from "@nestjs/common";
import { Episode } from "../domain/entities/episode.entity";
import { Season } from "../domain/entities/season.entity";
import { Serie } from "../domain/entities/serie.entity";
import { ISerieRepository } from "../domain/ports/serie.repository";
import { 
  PrismaService, 
  SerieWithRelations,
  serieInclude,
  serieWithMetadataAndSeasonCountInclude,
  SerieWithMetadataAndSeasonCount,
  seasonInclude,
  episodeInclude, 
} from "@safliix-back/database";
import { SerieMapper } from "../mappers/serie.mapper";
import { SeasonMapper } from "../mappers/season.mapper";
import { EpisodeMapper } from "../mappers/episode.mapper";
import { SerieFilter } from "../utils/types";

@Injectable()
export class PrismaSerieRepository implements ISerieRepository{

  constructor(
    private readonly prisma: PrismaService  
  ){}

  async save(serie: Serie): Promise<void> {
    const created = SerieMapper.toPrismaCreate(serie);
    console.dir(created,{depth:2});
    await this.prisma.serie.create({
      data: created,
    });
  }

  async update(serie: Serie): Promise<Serie> {

    const update = SerieMapper.toPrismaUpdate(serie.id!,serie);
    const result = await this.prisma.serie.update({
      ...update,
      include:serieInclude
    });
    return SerieMapper.toDomain(result);
  }

  async findById(id: string): Promise<Serie | null> {
    const serie: SerieWithRelations | null = await this.prisma.serie.findUnique({
      where: { id },
      include: serieInclude,
    });
    if (!serie) return null;
    return SerieMapper.toDomain(serie);
    
  }

  async findAll(filters?: SerieFilter): Promise<Serie[]> {
    const where: any = {};
    const metadataWhere: any = {};

    if (filters?.q) {
      metadataWhere.title = { contains: filters.q, mode: 'insensitive' };
    }
    if (filters?.category) {
      metadataWhere.category = {
        category: { contains: filters.category, mode: 'insensitive' },
      };
    }
    if (filters?.genre) {
      metadataWhere.gender = {
        name: { contains: filters.genre, mode: 'insensitive' },
      };
    }
    if (Object.keys(metadataWhere).length > 0) {
      where.metadata = metadataWhere;
    }

    const serie : SerieWithMetadataAndSeasonCount[] = await this.prisma.serie.findMany({
      where,
      include: serieWithMetadataAndSeasonCountInclude,
    });
    
    return serie.map(serie => SerieMapper.toDomain(serie));
  }

  
  async deleteById(id: string): Promise<void> {
    this.prisma.serie.delete({
      where: {id}
    });
  }

  async findSeasonsBySerieId(serieId: string): Promise<Season[]> {
    const seasons = await this.prisma.season.findMany({
      where: { serieId : serieId },
      include: seasonInclude,
    });

    return seasons.map(SeasonMapper.toDomain);
  }

  async findEpisodesBySeasonId(seasonId: string): Promise<Episode[]> {
    const episodes = await this.prisma.episode.findMany({
      where: { seasonId },
      include: episodeInclude
    });

    return episodes.map(EpisodeMapper.toDomain);
  }

  async countSeasons(serieId: string): Promise<number> {
    return this.prisma.season.count({
      where: { serieId:serieId },
    });
  }

  async countEpisodes(serieId: string): Promise<number> {
    return this.prisma.episode.count({
      where: { season: {serieId: serieId } },
    });
  }

  async createSeason(season: Season): Promise<Season> {
    const toCreate = SeasonMapper.toPrismaCreate(season);
    const created = await this.prisma.season.create({
      data: toCreate,
      include: seasonInclude,
    });

    return SeasonMapper.toDomain(created);
  }

  async updateSeason(season: Season): Promise<Season> {
    if (!season.id) throw new Error("season.id required for update");

    const toUpdate = SeasonMapper.toPrismaUpdate(season.id,season);
    const updated = await this.prisma.season.update({
      ...toUpdate,
      include: seasonInclude,
    });

    return SeasonMapper.toDomain(updated);
  }

  async deleteSeason(seasonId: string): Promise<void> {
    await this.prisma.season.delete({ where: { id: seasonId } });
  }

  async findSeasonById(seasonId: string): Promise<Season | null> {
    const result = await this.prisma.season.findUnique({
      where:{id:seasonId},
      include:seasonInclude
    });
    if(!result) return null;
    return SeasonMapper.toDomain(result);
  }

  async createEpisode(episode: Episode): Promise<Episode> {
  const toCreate = EpisodeMapper.toPrismaCreate(episode);
    const created = await this.prisma.episode.create({
      data: toCreate,
      include:episodeInclude
    });

    return EpisodeMapper.toDomain(created)
  }

  async updateEpisode(episode: Episode): Promise<Episode> {
    if (!episode.id) throw new Error("episode.id required for update");
    const toUpdate = EpisodeMapper.toPrismaUpdate(episode.id,episode);
    const updated = await this.prisma.episode.update({
      ...toUpdate,
      include:episodeInclude  
    });

    return EpisodeMapper.toDomain(updated)
;  }

  async deleteEpisode(episodeId: string): Promise<void> {
    await this.prisma.episode.delete({ where: { id: episodeId } });
  }

  async findEpisodeById(episodeId: string): Promise<Episode | null> {
    const result = await this.prisma.episode.findUnique({
      where:{id:episodeId},
      include:episodeInclude
    });
    if(result) return EpisodeMapper.toDomain(result);
    return null;
  }

  async moveEpisode(episodeId: string, toSeasonId: string): Promise<void> {
    await this.prisma.episode.update({
      where: { id: episodeId },
      data: {
        season: { connect: { id: toSeasonId } },
      },
    });
  }


  
  
}
