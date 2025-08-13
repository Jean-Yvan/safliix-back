import { Injectable } from "@nestjs/common";
import { Episode } from "../domain/entities/episode.entity";
import { Season } from "../domain/entities/season.entity";
import { Serie } from "../domain/entities/serie.entity";
import { SerieRepository } from "../domain/ports/serie.repository";
import { PrismaService } from "@safliix-back/database";
import { SerieMapper } from "../mappers/serie.mapper";

@Injectable()
export class PrismaSerieRepository implements SerieRepository{

  constructor(
    private readonly prisma: PrismaService 
  ){}

  async findById(id: string): Promise<Serie | null> {
    const serie = this.prisma.series.findUnique({
      where: { id },
      include: {
        metadata: {
          include: {
            format: true,
            category: true,
            actors: {
              include: {
                actor: true
              }
            }
          } 
        },
        seasons: {
          include: {
            episodes:{
              include: {
                videoFile: true,
                metadata: {
                  include: {
                    format: true,
                    category: true,
                    actors: {
                      include: {
                        actor: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
      }
    });

    if (!serie) return null;

    const serieResult = SerieMapper.toDomain(serie);

  }
  findAll(): Promise<Serie[]> {
    throw new Error("Method not implemented.");
  }
  save(serie: Serie): Promise<void> {
    throw new Error("Method not implemented.");
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