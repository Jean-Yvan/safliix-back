import { Purchase } from "../entities/purchase.entity";
//import { PurchaseWithRelation } from "@safliix-back/database";

export interface IPurchaseRepository {
  create(purchase: Purchase): Promise<Purchase>;
  update(id: string, purchase: Partial<Purchase>): Promise<Purchase>;
  delete(id: string): Promise<void>;

  findById(id: string): Promise<Purchase | null>;
  findByUserAndVideo(userId: string, videoId: string): Promise<Purchase | null>;
  findAllByUser(userId: string): Promise<Purchase[]>;
  findExpired(): Promise<Purchase[]>;
  findAll() : Promise<Purchase[]>;
  
}
