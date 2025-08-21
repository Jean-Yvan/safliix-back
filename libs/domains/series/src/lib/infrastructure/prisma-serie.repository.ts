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
  SerieToPrisma
} from "@safliix-back/database";
import { SerieMapper } from "../mappers/serie.mapper";

@Injectable()
export class PrismaSerieRepository implements ISerieRepository{

  constructor(
    private readonly prisma: PrismaService  
  ){}

  async findById(id: string): Promise<Serie | null> {
    const serie: SerieWithRelations | null = await this.prisma.series.findUnique({
      where: { id },
      include: serieInclude,
    });

    if (!serie) return null;

    const result = SerieMapper.toDomain(serie);

    if (result.isErr()) {
      
      throw result.unwrapErr();
    }

    return result.unwrap();
  }

  async findAll(): Promise<Serie[] | null> {
    const series : SerieWithMetadataAndSeasonCount[] = await this.prisma.series.findMany({
      include: serieWithMetadataAndSeasonCountInclude,
    });

    if(!series) return null;

    return series.map(serie => {
      const result = SerieMapper.toDomain(serie);
      if (result.isErr()) {
        throw result.unwrapErr();
      }
      return result.unwrap();
    });
  }

  async save(serie: Serie): Promise<Serie> {
    const data: SerieToPrisma = SerieMapper.toPrisma(serie); // typé grâce à nos types

    const id = data.id == null ? undefined : data.id;
    const serieResult = await this.prisma.series.upsert({
      where: { id },
      create: data,
      update: data,
      include: serieInclude // Use the correct include object compatible with SeriesInclude<DefaultArgs>
    });

    const s = SerieMapper.toDomain(serieResult);
    if(s.isErr()){
      throw s.unwrapErr()
    }

    return s.unwrap();
  }
  deleteById(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  update(serie: Serie): Promise<void> {
    throw new Error("Method not implemented.");
  }
  addEpisodeToSerie(serieId: string, episodeId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  removeEpisodeFromSerie(serieId: string, episodeId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  findEpisodesBySerieId(serieId: string): Promise<Episode[]> {
    throw new Error("Method not implemented.");
  }
  findEpisodeBySeasonId(seasonId: string): Promise<Episode[] | null> {
    throw new Error("Method not implemented.");
  }
  findSeasonsBySerieId(serieId: string): Promise<Season[]> {
    throw new Error("Method not implemented.");
  }
  addSeasonToSerie(serieId: string, seasonId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  removeSeasonFromSerie(serieId: string, seasonId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  
  
}