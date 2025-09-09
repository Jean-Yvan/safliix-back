// libs/shared/interfaces/src/lib/dto/admin-filter.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsBoolean, IsOptional, IsString, IsArray, IsDate } from 'class-validator';
import { AdminRole } from '../../utils/types';

export class AdminFilterDto {
  @ApiPropertyOptional({
    enum: AdminRole,
    description: 'Filtrer par rôle administrateur',
    example: AdminRole.SUPER_ADMIN
  })
  @IsEnum(AdminRole)
  @IsOptional()
  role?: AdminRole;

  @ApiPropertyOptional({
    description: 'Filtrer par statut actif/inactif',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Recherche textuelle dans le nom et l\'email',
    example: 'john'
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Date de création minimum',
    type: Date,
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  createdAtStart?: Date;

  @ApiPropertyOptional({
    description: 'Date de création maximum',
    type: Date,
    example: '2024-12-31T23:59:59.999Z'
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  createdAtEnd?: Date;

  @ApiPropertyOptional({
    description: 'Date de dernière connexion minimum',
    type: Date,
    example: '2024-06-01T00:00:00.000Z'
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  lastLoginStart?: Date;

  @ApiPropertyOptional({
    description: 'Date de dernière connexion maximum',
    type: Date,
    example: '2024-06-30T23:59:59.999Z'
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  lastLoginEnd?: Date;

  @ApiPropertyOptional({
    description: 'Filtrer par permissions spécifiques',
    type: [String],
    example: ['content:moderate', 'users:manage']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];

  // Méthode utilitaire pour conversion
  toPrismaFilter(): any {
    const filter: any = {};

    if (this.role) filter.role = this.role;
    if (this.isActive !== undefined) filter.isActive = this.isActive;
    if (this.search) {
      filter.OR = [
        { name: { contains: this.search, mode: 'insensitive' } },
        { email: { contains: this.search, mode: 'insensitive' } }
      ];
    }
    if (this.createdAtStart || this.createdAtEnd) {
      filter.createdAt = {};
      if (this.createdAtStart) filter.createdAt.gte = this.createdAtStart;
      if (this.createdAtEnd) filter.createdAt.lte = this.createdAtEnd;
    }
    if (this.lastLoginStart || this.lastLoginEnd) {
      filter.lastLoginAt = {};
      if (this.lastLoginStart) filter.lastLoginAt.gte = this.lastLoginStart;
      if (this.lastLoginEnd) filter.lastLoginAt.lte = this.lastLoginEnd;
    }
    if (this.permissions) {
      filter.permissions = { hasSome: this.permissions };
    }

    return filter;
  }
}