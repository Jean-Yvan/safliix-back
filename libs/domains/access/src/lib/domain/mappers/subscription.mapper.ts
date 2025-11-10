import { CreateToPrisma, SubscriptionWithRelation, UpdateToPrisma } from "@safliix-back/database";
import { Subscription } from "../entities/subscription.entity";
import { mapConnect,mapField } from "@safliix-back/common";
import { Result, Err,Ok } from "oxide.ts";

export class SubscriptionMapper{
  static toDomain(data:SubscriptionWithRelation):Subscription{
    return Subscription.restore(data);
  }

  static toPrismaCreate(data:Subscription) : CreateToPrisma<"Subscription">  {
    return {
      user: mapConnect(data.userId),
      plan:mapConnect(data.planId),
      country: data.country ?? undefined,
      startDate: data.startDate ?? undefined,
      endDate: data.endDate ?? undefined,
      renewalStatus: data.renewalStatus
    }
  }

  static toPrismaUpdate(
    data: Partial<Subscription> & { id: string }
  ): Result<UpdateToPrisma<"Subscription">,Error> {
    if (!data.id) {
      return Err(new Error("id is required for update"));
    }

    return Ok({
      where:{
        id: data.id
      },
      data:{
        user: mapField(data.userId, mapConnect),
        plan: mapField(data.planId, mapConnect),
        country: mapField(data.country),
        startDate: mapField(data.startDate),
        endDate: mapField(data.endDate),
        renewalStatus: mapField(data.renewalStatus),
      }
      
    });
  }
}
