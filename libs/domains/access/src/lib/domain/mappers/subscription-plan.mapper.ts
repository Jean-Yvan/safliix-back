import { CreateToPrisma, SubscriptionPlanWithRelation, UpdateToPrisma } from "@safliix-back/database";
import { SubscriptionPlan } from "../entities/subscription-plan.entity";
import { Result, Err, Ok } from "oxide.ts";
import { mapField } from "@safliix-back/common";

export class SubscriptionPlanMapper{
  static toDomain(data:SubscriptionPlanWithRelation):SubscriptionPlan{
    return SubscriptionPlan.restore(data);
  }

  static toPrismaCreate(data:SubscriptionPlan):CreateToPrisma<"SubscriptionPlan">{
    return {
      name:data.name,
      price:data.price,
      maxSharedAccounts:data.maxSharedAccounts,
      createdAt:data.createdAt ?? undefined,
      updatedAt:data.updatedAt ?? undefined,
      videoQuality:'HD'
    }
  }

  static toPrismaUpdate(data:Partial<SubscriptionPlan> & { id: string })
    :Result<UpdateToPrisma<"SubscriptionPlan">,Error>{
    
      if(!data.id){
        return Err(new Error("The id must be provided"));
      }
      return Ok({
        where: {
          id : data.id
        },
        data:{
          price:mapField(data.price),
          maxSharedAccounts:mapField(data.maxSharedAccounts),
        }
        
      })
  }
}