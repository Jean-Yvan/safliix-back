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
      movie:mapConnect(data.movieId),
      purchaseDate:data.purchaseDate,
      country:data.country ?? 'other',
      expirationDate:data.expirationDate
    }
  }

  static toUpdatePrisma(id:string,data:Partial<Purchase>) : UpdateToPrisma<"Purchase">{
    return {
      where:{
        id
      },
      data:{
        user: mapField(data.userId, mapConnect),
        movie: mapField(data.movieId, mapConnect),
        purchaseDate:mapField(data.purchaseDate),
        country:mapField(data.country),
        expirationDate:mapField(data.expirationDate)
      }
    }
  }
}
