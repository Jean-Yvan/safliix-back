import { BaseHandler } from "@safliix-back/cqrs";
import { Result, Err } from "oxide.ts";
import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { ISubscriptionRepository } from "../../domain/ports/subscription.repository";
import { SUBSCRIPTION_REPOSITORY } from "../../utils/types";
import { Subscription, SubscriptionUpdateProps } from "../../domain/entities/subscription.entity";
import { UpdateSubscriptionCommand } from "../cqrs/commands/update-subscription.command";
import { UpdateSubscriptionDto } from "../../interfaces/dto/update-subscription.dto";

@Injectable()
@CommandHandler(UpdateSubscriptionCommand)
export class UpdateSubscriptionHandler extends BaseHandler<UpdateSubscriptionCommand, Result<Subscription, Error>> {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly repository: ISubscriptionRepository
  ) {
    super();
  }

  protected override async handle(command: UpdateSubscriptionCommand): Promise<Result<Subscription, Error>> {
    const existingResult = await this.repository.findById(command.payload.id);
    if (existingResult.isErr()) {
      return Err(existingResult.unwrapErr());
    }

    const updated = existingResult.unwrap().updateWith(mapUpdateDtoToProps(command.payload));

    if(updated.isErr()){
      return Err(updated.unwrapErr());
    }

    return this.repository.update(command.payload.id, updated.unwrap());
  }
}

const mapUpdateDtoToProps = (dto: UpdateSubscriptionDto): SubscriptionUpdateProps => {
  const toDate = (value?: string): Date | undefined => {
    if (!value) {
      return undefined;
    }
    return new Date(value);
  };

  return {
    userId: dto.userId,
    planId: dto.planId,
    startDate: dto.startDate === undefined ? undefined : toDate(dto.startDate),
    endDate: dto.endDate === undefined ? undefined : toDate(dto.endDate),
    renewalStatus: dto.renewalStatus as SubscriptionUpdateProps["renewalStatus"],
    country: dto.country,
  };
};
