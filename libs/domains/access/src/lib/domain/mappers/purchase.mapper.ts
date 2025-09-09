import { CreateToPrisma,UpdateToPrisma,PurchaseWithRelation } from "@safliix-back/database";
import { Purchase } from "../entities/purchase.entity";
import { mapConnect, mapField } from "@safliix-back/common";

export class PurchaseMapper{

  static toDomain(data:PurchaseWithRelation) : Purchase {
    return Purchase.restore(data);
  }

  static toCreatePrisma(data:Purchase) : CreateToPrisma<"Purchase">{
    return {
      user: mapConnect(data.userId),
      video:mapConnect(data.videoId),
      purchaseDate:data.purchaseDate,
      country:data.country ?? '',
      expirationDate:data.expirationDate
    }
  }

  static toUpdatePrisma(id:string,data:Purchase) : UpdateToPrisma<"Purchase">{
    return {
      where:{
        id
      },
      data:{
        purchaseDate:mapField(data.purchaseDate),
        country:mapField(data.country),
        expirationDate:mapField(data.expirationDate)
      }
    }
  }
}