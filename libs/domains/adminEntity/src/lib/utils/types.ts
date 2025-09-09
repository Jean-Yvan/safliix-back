export enum AdminRole{
  ADMIN,
  SUPER_ADMIN
}


export interface AdminFilter {
  role?: AdminRole;
  isActive?: boolean;
  search?: string;
  createdAtStart?: Date;
  createdAtEnd?: Date;
  lastLoginStart?: Date;
  lastLoginEnd?: Date;
  permissions?: string[];
}

export const ADMIN_REPOSITORY = 'ADMIN_REPOSITORY'; 