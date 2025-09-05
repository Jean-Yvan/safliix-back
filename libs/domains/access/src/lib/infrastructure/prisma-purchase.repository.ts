import { Injectable } from "@nestjs/common";
import { PrismaService, purchaseInclude, PurchaseWithRelation } from "@safliix-back/database";
import { IPurchaseRepository } from "../domain/ports/purchase.repository";
import { Purchase } from "../domain/entities/purchase.entity";
import { PurchaseMapper } from "../domain/mappers/purchase.mapper";

@Injectable()
export class PurchaseRepository implements IPurchaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(purchase: Purchase): Promise<Purchase> {
    
      const created = await this.prisma.purchase.create({
      data: PurchaseMapper.toCreatePrisma(purchase),
      include: purchaseInclude
    });
    return PurchaseMapper.toDomain(created);
    
    
  }

  async update(id: string, purchase:Purchase): Promise<Purchase> {


    const updated = await this.prisma.purchase.update({
      ...PurchaseMapper.toUpdatePrisma(id,purchase),
        include: purchaseInclude
    });
    return PurchaseMapper.toDomain(updated as PurchaseWithRelation);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.purchase.delete({ where: { id } });
  }

  async findById(id: string): Promise<Purchase | null> {
    const data = await this.prisma.purchase.findUnique({ where: { id } });
    return data ? Purchase.restore(data as PurchaseWithRelation) : null;
  }

  async findByUserAndVideo(userId: string, videoId: string): Promise<Purchase | null> {
    const data = await this.prisma.purchase.findFirst({
      where: { userId, videoId },
    });
    return data ? Purchase.restore(data as PurchaseWithRelation) : null;
  }

  async findAllByUser(userId: string): Promise<Purchase[]> {
    const data = await this.prisma.purchase.findMany({
      where: { userId },
      orderBy: { purchaseDate: "desc" },
    });
    return data.map((d) => PurchaseMapper.toDomain(d as PurchaseWithRelation));
  }

  async findExpired(): Promise<Purchase[]> {
    const data = await this.prisma.purchase.findMany({
      where: {
        expirationDate: { lt: new Date() },
      },
    });
    return data.map((d) => Purchase.restore(d as PurchaseWithRelation));
  }

  async findAll(): Promise<Purchase[]> {
    const data = await this.prisma.purchase.findMany({
      include: {
        user: true,
        video: true,
      },
    });
    return data.map((d) => Purchase.restore(d as PurchaseWithRelation));
  }
}
