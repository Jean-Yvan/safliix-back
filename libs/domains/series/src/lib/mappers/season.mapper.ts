import { mapConnect } from "@safliix-back/common";
import { Season } from "../domain/entities/season.entity";

import { SeasonWithRelations,CreateToPrisma,UpdateToPrisma } from "@safliix-back/database";
export class SeasonMapper{

  static toDomain (prismaSeason: SeasonWithRelations): Season {
    return Season.restore(prismaSeason);
  }

  static toPrismaCreate(season: Season): CreateToPrisma<"Season"> {
    const data = {
      id: season.id,
      number: season.number,
      series: mapConnect(season.serieId),
      title: season.title,
    };

    return data;
  }

  static toPrismaUpdate(id:string,season: Season): UpdateToPrisma<"Season">{
    return {
      where:{id},
      data:{
        number: season.number,
        series: mapConnect(season.serieId),
      }
    }
  }

}