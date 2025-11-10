import { Result } from "oxide.ts";
import { User } from "../entities/user.entity";

export interface IUserRepository {
  findById(id: string): Promise<Result<User, Error>>;
  findByEmail(email: string): Promise<Result<User, Error>>;
  findAll(filters?: string[]): Promise<Result<User[], Error>>;
  save(user: User): Promise<Result<User, Error>>;
  delete(id: string): Promise<Result<boolean, Error>>;
}
