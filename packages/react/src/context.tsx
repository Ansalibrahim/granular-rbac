import React, { createContext, useContext, ReactNode } from 'react';

export interface User {
  id: number;
  permissions?: string[];
  roles?: Array<{ name: string; permissions: string[] }>;
  userType?: string;
  [key: string]: any;
}

export interface PermissionEngine {
  userHasPermission(user: User | null, permission: string, tenantId?: any): boolean;
  userHasAnyPermission(user: User | null, permissions: string[], tenantId?: any): boolean;
  userHasAllPermissions(user: User | null, permissions: string[], tenantId?: any): boolean;
  userHasRole(user: User | null, role: string, tenantId?: any): boolean;
  userHasAnyRole(user: User | null, roles: string[], tenantId?: any): boolean;
  userCanBypassPermissions(user: User | null): boolean;
  getUserPermissions(user: User | null): string[];
}

export interface RBACConfig {
  permissions: Record<string, any>;
  tenant?: {
    field: string;
    model: string;
  };
}

interface RBACContextValue {
  user: User | null;
  engine: PermissionEngine;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  canBypassPermissions: () => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  getUserPermissions: () => string[];
}

const RBACContext = createContext<RBACContextValue | null>(null);

interface RBACProviderProps {
  children: ReactNode;
  user: User | null;
  config: RBACConfig;
  tenantId?: number;
}

// Simple permission engine implementation
class SimplePermissionEngine implements PermissionEngine {
  constructor(private config: RBACConfig) {}

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

  userCanBypassPermissions(user: User | null): boolean {
    if (!user) return false;
    return user.userType === 'superadmin' || user.userType === 'admin';
  }

  getUserPermissions(user: User | null): string[] {
    if (!user) return [];
    
    const permissions = new Set<string>();
    
    // Add direct permissions
    if (user.permissions) {
      user.permissions.forEach(p => permissions.add(p));
    }
    
    // Add role permissions
    if (user.roles) {
      user.roles.forEach(role => {
        role.permissions.forEach(p => permissions.add(p));
      });
    }
    
    return Array.from(permissions);
  }
}

export function RBACProvider({ children, user, config, tenantId }: RBACProviderProps) {
  const engine = new SimplePermissionEngine(config);
  
  const hasPermission = (permission: string): boolean => {
    return engine.userHasPermission(user, permission, tenantId);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return engine.userHasAnyPermission(user, permissions, tenantId);
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return engine.userHasAllPermissions(user, permissions, tenantId);
  };

  const hasRole = (roleName: string): boolean => {
    return engine.userHasRole(user, roleName, tenantId);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    return engine.userHasAnyRole(user, roleNames, tenantId);
  };

  const canBypassPermissions = (): boolean => {
    return engine.userCanBypassPermissions(user);
  };

  const isAdmin = (): boolean => {
    return user?.userType === 'admin' || user?.userType === 'superadmin';
  };

  const isSuperAdmin = (): boolean => {
    return user?.userType === 'superadmin';
  };

  const getUserPermissions = (): string[] => {
    return engine.getUserPermissions(user);
  };

  return (
    <RBACContext.Provider value={{ 
      user, 
      engine, 
      hasPermission, 
      hasAnyPermission, 
      hasAllPermissions,
      hasRole,
      hasAnyRole,
      canBypassPermissions,
      isAdmin,
      isSuperAdmin,
      getUserPermissions
    }}>
      {children}
    </RBACContext.Provider>
  );
}

export function useRBAC() {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within RBACProvider');
  }
  return context;
}