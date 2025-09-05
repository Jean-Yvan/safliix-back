import { CreateSubscriptionPlanDto } from "./create-subscription-plan.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsString,IsNotEmpty } from "class-validator";

export class UpdateSubscriptionPlanDto extends PartialType(CreateSubscriptionPlanDto){
  @IsString({message:"L'id de l'utilisateur est obligatoire"})
  @IsNotEmpty({message:"L'id ne peut être vide"})
  id!:string;
}