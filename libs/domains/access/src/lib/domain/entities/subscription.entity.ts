import { CreateSubscriptionDto } from "src/lib/interfaces/dto/create-subscription.dto";
import { Result, Err, Ok } from 'oxide.ts';
import { SubscriptionWithRelation } from '@safliix-back/database';


export class Subscription{
  private constructor(
    public readonly id:string | undefined,
    public readonly userId: string,
    public readonly planId: string,
    public readonly startDate: Date | null,
    public readonly endDate: Date | null,
    public readonly renewalStatus: string,
    public readonly country: string,

    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
  ){}

  static create(data: CreateSubscriptionDto) : Result<Subscription,Error> {
    return Ok(new Subscription(
      undefined,
      data.userId,
      data.planId,
      null,
      null,
      '',
      data.country ?? '',
      null,
      null
    ))
  }

  static restore(data : SubscriptionWithRelation) : Subscription {
    return new Subscription(
      data.id,
      data.userId,
      data.planId,
      data.startDate,
      data.endDate,
      data.renewalStatus,
      data.country,
      data.createdAt,
      data.updatedAt
    )
  }

  
}