import { Injectable } from '@nestjs/common';
import { PrismaService, userWithRelationsInclude } from '@safliix-back/database';
import { IUserRepository } from '../domain/ports/user.repository';
import { User } from '../domain/entities/user.entity';
import { UserMapper } from '../domain/mappers/user.mapper';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
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
    try {
      const data = UserMapper.toPrismaCreate(user);
      const saved = await this.prisma.user.upsert({
        where: { id: user.id },
        update: data,
        create: data,
        include:userWithRelationsInclude
      });
      return (UserMapper.toDomain(saved));
    } catch (e) {
      throw(e as Error);
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
