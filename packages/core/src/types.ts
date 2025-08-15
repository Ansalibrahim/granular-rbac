export interface Permission {
  name: string;
  description: string;
  shortName: string;
}

export interface PermissionModule {
  [key: string]: Permission[];
}

export interface RBACConfig {
  permissions: Record<string, Permission[]>;
  tenant: {
    field: string;        // 'shopId', 'organizationId', etc.
    model: string;        // 'Shop', 'Organization', etc.
  };
  database?: {
    dialect: 'postgres' | 'mysql' | 'sqlite';
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
  };
}

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: 'superadmin' | 'admin' | 'user';
  [key: string]: any; // For dynamic tenant field
  roles?: Role[];
  permissions?: string[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
  [key: string]: any; // For dynamic tenant field
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface AssignRoleRequest {
  userId: number;
  roleId: number;
}

export type UserType = 'superadmin' | 'admin' | 'user';

export interface PermissionValidationResult {
  valid: string[];
  invalid: string[];
}

export interface UserPermissionCheck {
  user: User;
  permission: string;
  tenantId?: number;
  hasAccess: boolean;
}
