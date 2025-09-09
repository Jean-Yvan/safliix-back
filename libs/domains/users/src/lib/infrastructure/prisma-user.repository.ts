import { Injectable } from '@nestjs/common';
import { PrismaService, userWithRelationsInclude } from '@safliix-back/database';
import { IUserRepository } from '../domain/ports/user.repository';
import { User } from '../domain/entities/user.entity';
import { UserMapper } from '../domain/mappers/user.mapper';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new Error('User not found');
      return UserMapper.toDomain(user);
    } catch (e) {
      throw (e as Error);
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      
      if (!user) throw(new Error('User not found'));
      return UserMapper.toDomain(user);
    } catch (e) {
      throw(e as Error);
    }
  }

  async findAll(filters?: string[]): Promise<User[]> {
    try {
      const where = filters?.length
        ? { OR: filters.map(f => ({ name: { contains: f } })) }
        : undefined;

      const users = await this.prisma.user.findMany({ where });
      return users.map(UserMapper.toDomain);
    } catch (e) {
      throw(e as Error);
    }
  }

  async save(user: User): Promise<User> {
  

  if (!user.id) {
    // Création
    const data = UserMapper.toPrismaCreate(user);
    console.dir(data, {depth:2});
    const created = await this.prisma.user.create({
      data,
      include: userWithRelationsInclude
    });
    return UserMapper.toDomain(created);
  } else {
    // Mise à jour
    const data = UserMapper.toPrismaUpdate(user.id,user);
    const updated = await this.prisma.user.update({
      ...data,
      include:userWithRelationsInclude
    });
    return UserMapper.toDomain(updated);
  }
}

  

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (e) {
      throw(e as Error);
    }
  }
}
