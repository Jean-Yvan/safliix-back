import { Injectable } from '@nestjs/common';
import { PrismaService, userWithRelationsInclude } from '@safliix-back/database';
import { IUserRepository } from '../domain/ports/user.repository';
import { User } from '../domain/entities/user.entity';
import { UserMapper } from '../domain/mappers/user.mapper';
import { Result, Ok, Err } from 'oxide.ts';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Result<User, Error>> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id }, include:userWithRelationsInclude });
      if (!user) {
        return Err(new Error('User not found'));
      }
      return Ok(UserMapper.toDomain(user));
    } catch (e) {
      return Err(e as Error);
    }
  }

  async findByEmail(email: string): Promise<Result<User, Error>> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email },include:userWithRelationsInclude });

      if (!user) {
        return Err(new Error('User not found'));
      }
      return Ok(UserMapper.toDomain(user));
    } catch (e) {
      return Err(e as Error);
    }
  }

  async findAll(filters?: string[]): Promise<Result<User[], Error>> {
    try {
      const where = filters?.length
        ? { OR: filters.map((f) => ({ name: { contains: f } })) }
        : undefined;

      const users = await this.prisma.user.findMany({where, include:userWithRelationsInclude });
      return Ok(users.map(UserMapper.toDomain));
    } catch (e) {
      return Err(e as Error);
    }
  }

  async save(user: User): Promise<Result<User, Error>> {
    try {
      if (!user.id) {
        const data = UserMapper.toPrismaCreate(user);
        const created = await this.prisma.user.create({
          data,
          include: userWithRelationsInclude,
        });
        return Ok(UserMapper.toDomain(created));
      } else {
        const data = UserMapper.toPrismaUpdate(user.id, user);
        const updated = await this.prisma.user.update({
          ...data,
          include: userWithRelationsInclude,
        });
        return Ok(UserMapper.toDomain(updated));
      }
    } catch (e) {
      return Err(e as Error);
    }
  }

  async delete(id: string): Promise<Result<boolean, Error>> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return Ok(true);
    } catch (e) {
      return Err(e as Error);
    }
  }
}
