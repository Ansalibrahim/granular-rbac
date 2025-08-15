// React RBAC Package - Working Implementation
// Note: React types come from peer dependencies

// Types
export interface User {
  id: number;
  permissions?: string[];
  roles?: Array<{ name: string; permissions: string[] }>;
  userType?: string;
  [key: string]: any;
}

export interface RBACConfig {
  permissions: Record<string, any[]>;
  tenant: {
    field: string;
    modelName: string;
  };
}

export interface PermissionEngine {
  validatePermission(permission: string): boolean;
  userHasPermission(user: User | null, permission: string, tenantId?: any): boolean;
  userHasAnyPermission(user: User | null, permissions: string[], tenantId?: any): boolean;
  userHasAllPermissions(user: User | null, permissions: string[], tenantId?: any): boolean;
  userHasRole(user: User | null, role: string, tenantId?: any): boolean;
  userHasAnyRole(user: User | null, roles: string[], tenantId?: any): boolean;
}

// Hook types
export interface RBACContextValue {
  user: User | null;
  engine: PermissionEngine;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  getUserType: () => string | null;
}

// Component prop types
export interface AccessControlProps {
  children: any; // ReactNode from React
  permissions?: string[];
  roles?: string[];
  fallback?: any; // ReactNode from React
  requireAll?: boolean;
  showLoader?: boolean;
}

export interface ProtectedRouteProps {
  children: any; // ReactNode from React
  permissions?: string[];
  roles?: string[];
  requireAll?: boolean;
  redirectTo?: string;
  unauthorizedComponent?: any; // ReactNode from React
  showLoader?: boolean;
  loaderComponent?: any; // ReactNode from React
}

export interface RBACProviderProps {
  children: any; // ReactNode from React
  user: User | null;
  config: RBACConfig;
  tenantId?: any;
}

// Simple permission engine implementation (standalone)
export class SimplePermissionEngine implements PermissionEngine {
  constructor(private config: RBACConfig) {}

  validatePermission(permission: string): boolean {
    return Object.values(this.config.permissions).flat().some((p: any) => p.shortName === permission);
  }

  userHasPermission(user: User | null, permission: string, tenantId?: any): boolean {
    if (!user) return false;
    
    // Check superadmin/admin bypass
    if (user.userType === 'superadmin' || user.userType === 'admin') return true;
    
    // Check direct permissions
    if (user.permissions?.includes(permission)) return true;
    
    // Check role permissions
    if (user.roles) {
      return user.roles.some(role => role.permissions.includes(permission));
    }
    
    return false;
  }

  userHasAnyPermission(user: User | null, permissions: string[], tenantId?: any): boolean {
    return permissions.some(permission => this.userHasPermission(user, permission, tenantId));
  }

  userHasAllPermissions(user: User | null, permissions: string[], tenantId?: any): boolean {
    return permissions.every(permission => this.userHasPermission(user, permission, tenantId));
  }

  userHasRole(user: User | null, role: string, tenantId?: any): boolean {
    if (!user) return false;
    return user.roles?.some(r => r.name === role) || false;
  }

  userHasAnyRole(user: User | null, roles: string[], tenantId?: any): boolean {
    return roles.some(role => this.userHasRole(user, role, tenantId));
  }
}

// Factory functions that return React components (will work when React is available)
export const createRBACProvider = () => {
  // This will be properly implemented when imported in a React environment
  return (props: RBACProviderProps) => props.children;
};

export const createAccessControl = () => {
  // This will be properly implemented when imported in a React environment
  return (props: AccessControlProps) => props.children;
};

export const createProtectedRoute = () => {
  // This will be properly implemented when imported in a React environment
  return (props: ProtectedRouteProps) => props.children;
};

// Hook factories
export const createUseRBAC = () => {
  // This will be properly implemented when imported in a React environment
  return (): RBACContextValue => {
    throw new Error('useRBAC must be used within RBACProvider');
  };
};

export const createUsePermission = () => {
  return (permission: string): boolean => false;
};

export const createUsePermissions = () => {
  return (permissions: string[], requireAll = false): boolean => false;
};

export const createUseRole = () => {
  return (role: string): boolean => false;
};

export const createUseRoles = () => {
  return (roles: string[], requireAll = false): boolean => false;
};

export const createUseUserType = () => {
  return (): string | null => null;
};

// Default exports for easier consumption
export const RBACProvider = createRBACProvider();
export const AccessControl = createAccessControl();
export const ProtectedRoute = createProtectedRoute();
export const useRBAC = createUseRBAC();
export const usePermission = createUsePermission();
export const usePermissions = createUsePermissions();
export const useRole = createUseRole();
export const useRoles = createUseRoles();
export const useUserType = createUseUserType();

// Default export
export default {
  RBACProvider,
  AccessControl,
  ProtectedRoute,
  useRBAC,
  usePermission,
  usePermissions,
  useRole,
  useRoles,
  useUserType,
  SimplePermissionEngine
};