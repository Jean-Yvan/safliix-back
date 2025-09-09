// libs/domains/admin/src/lib/repositories/prisma-admin.repository.ts
import { Injectable } from '@nestjs/common';
import { adminInclude, PrismaService } from '@safliix-back/database';
import { AdminEntity as Admin } from '../domain/entities/admin.entity';
import { AdminRepository } from '../domain/port/admin.repository';
import { AdminFilter, AdminRole } from '../utils/types';
import { AdminMapper } from '../domain/mappers/admin.mapper';

@Injectable()
export class PrismaAdminRepository implements AdminRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  
  activateAdmin(adminId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  deactivateAdmin(adminId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  isActive(adminId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  // CRUD Basics
  async findById(id: string): Promise<Admin | null> {
    const dbAdmin = await this.prisma.admin.findUnique({
      where: { id },
      include: adminInclude
    });

    return dbAdmin ? AdminMapper.toDomain(dbAdmin) : null;
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const dbAdmin = await this.prisma.admin.findUnique({
      where: { email },
      include: adminInclude
    });

    return dbAdmin ? AdminMapper.toDomain(dbAdmin) : null;
  }

  async findAll(): Promise<Admin[]> {
    const admins = await this.prisma.admin.findMany({
      include: adminInclude,
      orderBy: { createdAt: 'desc' }
    });

    return admins.map(AdminMapper.toDomain);
  }

  async create(admin: Admin): Promise<void> {
    const data = AdminMapper.toCreatePrisma(admin);
    await this.prisma.admin.create({
      data
    });
  }

  async update(admin: Admin): Promise<void> {
    const data = AdminMapper.toUpdatePrisma(admin.id!,admin);
    await this.prisma.admin.update({
     ...data,
     include: adminInclude
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.admin.delete({ where: { id } });
  }

  

  // Gestion des Sessions
  async updateLastLogin(adminId: string, date: Date): Promise<void> {
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { lastLoginAt: date }
    });
  }

  async invalidateSessions(adminId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { adminId }
    });
  }

  
  

  // Statistiques
  async count(): Promise<number> {
    return this.prisma.admin.count();
  }

  async find(filters?: AdminFilter): Promise<Admin[]> {
    const where = this.buildWhereClause(filters);
    
    const admins = await this.prisma.admin.findMany({
      where,
      include: adminInclude,
      orderBy: { createdAt: 'desc' }
    });

    return admins.map(AdminMapper.toDomain);
  }

  private buildWhereClause(filters?: AdminFilter){
    if (!filters) return {};

    const where : Record<string,any> = {}

    // Filtre par rôle
    if (filters.role) {
      where.role = filters.role;
    }


    // Recherche textuelle (nom ou email)
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    // Filtre par date de création
    if (filters.createdAtStart || filters.createdAtEnd) {
      where.createdAt = {};
      if (filters.createdAtStart) {
        where.createdAt.gte = filters.createdAtStart;
      }
      if (filters.createdAtEnd) {
        where.createdAt.lte = filters.createdAtEnd;
      }
    }

    // Filtre par dernière connexion
    if (filters.lastLoginStart || filters.lastLoginEnd) {
      where.lastLoginAt = {};
      if (filters.lastLoginStart) {
        where.lastLoginAt.gte = filters.lastLoginStart;
      }
      if (filters.lastLoginEnd) {
        where.lastLoginAt.lte = filters.lastLoginEnd;
      }
    }

    // Filtre par permissions
    if (filters.permissions && filters.permissions.length > 0) {
      where.permissions = {
        hasSome: filters.permissions
      };
    }

    return where;
  }


  
}