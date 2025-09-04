import { SubscriptionPlanWithRelation } from "@safliix-back/database";
import { CreateSubscriptionPlanDto } from "../../interfaces/dto/create-subscription-plan.dto";
import { Result, Err, Ok } from 'oxide.ts'; 

export class SubscriptionPlan{
  private constructor(
    public readonly id: string | undefined,
    public readonly name: string,
    public readonly price:number,
    public readonly maxSharedAccounts: number,
    public readonly createdAt : Date | null,
    public readonly updatedAt: Date | null 
  ){}

  static create(data:CreateSubscriptionPlanDto) : Result<SubscriptionPlan,Error>{
    if(data.price <= 0){
      return Err(new Error("Le prix doit un entier positif"));
    }
    if(data.maxSharedAccounts < 0){
      return Err(new Error("Le nombre d'écran doit un entier positif"));
    }

    return Ok(new SubscriptionPlan(
      undefined,
      data.name,
      data.price,
      data.maxSharedAccounts,
      null,
      null
    ))
  }

  static restore(data:SubscriptionPlanWithRelation) : SubscriptionPlan{
    return new SubscriptionPlan(
      data.id,
      data.name,
      data.price,
      data.maxSharedAccounts,
      data.createdAt,
      data.updatedAt
    )
  }

  
}