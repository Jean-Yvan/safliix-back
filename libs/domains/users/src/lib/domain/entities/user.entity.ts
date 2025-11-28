import { CreateUserDto } from "../../interfaces/dto/create-user.dto";
import { UserWithoutRelation, UserWithRelation } from "@safliix-back/database";
import { Result, Ok } from 'oxide.ts';
import { UpdateUserDto } from "../../interfaces/dto/update-user.dto";

export class User {
  private constructor(
    public readonly id: string | undefined,
    public email: string,
    public  name: string | null,
    public  avatarUrl: string | null,
    public  lastLoginAt: Date | null,
    public  isVerified = false,
    public  isMainAccount = true,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    // Relations optionnelles, pour DDD elles restent immuables depuis la DB
    public readonly sessions?: unknown[],
    public readonly subscriptions?: unknown[],
    public readonly sharedAccounts?: unknown[],
    public readonly adViews?: unknown[],
    public readonly userVideoView?: unknown[],
    public readonly seasonView?: unknown[],
    public readonly emailValidation?: unknown[],
  ) {}

  // Factory pour créer un nouvel utilisateur
  static async create(props: CreateUserDto): Promise<Result<User,Error>> {
    

    

    return Ok(new User(
      undefined,
      props.email,
      props.name,
      props.avatarUrl ?? null,
      null,
      false,
      true,
    ));
  }

  // Restore depuis la DB (Prisma)
  static restore(props: UserWithRelation | UserWithoutRelation): User {
    return new User(
      props.id,
      props.email,
      props.name,
      props.avatarUrl,
      props.lastLoginAt,
      props.isVerified,
      props.isMainAccount,
      props.createdAt,
      props.updatedAt,
      "sessions" in props ? props.sessions : undefined,
     "subscriptions" in props ? props.subscriptions : undefined,
      "ownedSharedAccounts" in props ? props.ownedSharedAccounts : undefined,
      "adViews" in props ? props.adViews : undefined,
      "userVideoView" in props ? props.userVideoView : undefined,
      "seasonView" in props ? props.seasonView : undefined,
      "emailValidation" in props ? props.emailValidation : undefined
    );
  }

  async updateWith(dto:UpdateUserDto){
    if(dto.email != undefined){
      this.email = dto.email;
    }

    if(dto.name != undefined){
      this.name = dto.name;
    }

    

    
  }

  
}
