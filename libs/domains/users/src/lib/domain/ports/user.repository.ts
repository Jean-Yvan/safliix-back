import { User } from "../entities/user.entity";


export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters?:string[]): Promise<User[]>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
