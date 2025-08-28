import { Session } from "../entities/session.entity";

export interface ISessionRepository {
  findById(id: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  create(session: Session): Promise<void>;
  update(session: Session): Promise<void>;
  delete(id: string): Promise<void>;
}
