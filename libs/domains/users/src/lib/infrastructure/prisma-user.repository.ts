import { Injectable } from '@nestjs/common';
import { PrismaService } from '@safliix-back/database';
import { Result, Ok, Err } from 'oxide.ts';
import { IUserRepository } from '../domain/ports/user.repository';
import { User } from '../domain/entities/user.entity';
import { UserMapper } from '../domain/mappers/user.mapper';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Result<User, Error>> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) return Err(new Error('User not found'));
      return Ok(UserMapper.toDomain(user));
    } catch (e) {
      return Err(e as Error);
    }
  }

  async findByEmail(email: string): Promise<Result<User, Error>> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) return Err(new Error('User not found'));
      return Ok(UserMapper.toDomain(user));
    } catch (e) {
      return Err(e as Error);
    }
  }

  async findAll(filters?: string[]): Promise<Result<User[], Error>> {
    try {
      const where = filters?.length
        ? { OR: filters.map(f => ({ name: { contains: f } })) }
        : undefined;

      const users = await this.prisma.user.findMany({ where });
      return Ok(users.map(UserMapper.toDomain));
    } catch (e) {
      return Err(e as Error);
    }
  }

  async save(user: User): Promise<Result<User, Error>> {
    try {
      const data = UserMapper.toPrisma(user);
      const saved = await this.prisma.user.upsert({
        where: { id: user.id },
        update: data,
        create: data,
      });
      return Ok(UserMapper.toDomain(saved));
    } catch (e) {
      return Err(e as Error);
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return Ok(undefined);
    } catch (e) {
      return Err(e as Error);
    }
  }
}
