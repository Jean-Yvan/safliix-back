import { CreateUserDto } from "../../interfaces/dto/create-user.dto";
import { Password } from '@safliix-back/common';
import { UserWithoutRelation, UserWithRelation } from "@safliix-back/database";
import { Result, Ok,Err } from 'oxide.ts';

export class User {
  private constructor(
    public readonly id: string | undefined,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly name: string | null,
    public readonly avatarUrl: string | null,
    public readonly lastLoginAt: Date | null,
    public readonly isVerified = false,
    public readonly isMainAccount = true,
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
    const passwordResult = await Password.create(props.password);

    if(passwordResult.isErr()){
      return Err(passwordResult.unwrapErr());
    }

    return Ok(new User(
      undefined,
      props.email,
      passwordResult.unwrap().value,
      props.name,
      props.avatarUrl ?? null,
      null,
      false,
      props.isMainAccount ?? true,
    ));
  }

  // Restore depuis la DB (Prisma)
  static restore(props: UserWithRelation | UserWithoutRelation): User {
    return new User(
      props.id,
      props.email,
      props.password_hash,
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
      "SeasonView" in props ? props.SeasonView : undefined,
      "EmailValidation" in props ? props.EmailValidation : undefined
    );
  }
}
