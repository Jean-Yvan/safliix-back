// libs/domains/admin/src/lib/ports/admin.repository.ts
import { AdminEntity as Admin } from '../entities/admin.entity';
import { AdminFilter } from '../../utils/types';

export interface AdminRepository {
  // CRUD Basics
  findById(id: string): Promise<Admin | null>;
  findByEmail(email: string): Promise<Admin | null>;
  find(filters?: AdminFilter): Promise<Admin[]>;
  create(admin: Admin): Promise<void>;
  update(admin: Admin): Promise<void>;
  deleteById(id: string): Promise<void>;
  
  
  // Gestion des Sessions
  updateLastLogin(adminId: string, date: Date): Promise<void>;
  invalidateSessions(adminId: string): Promise<void>;
  
  
  
  // Gestion du Statut
  activateAdmin(adminId: string): Promise<void>;
  deactivateAdmin(adminId: string): Promise<void>;
  isActive(adminId: string): Promise<boolean>;
}