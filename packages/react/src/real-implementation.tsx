import React, { createContext, useContext, ReactNode } from 'react';

// Types
export interface User {
  id: number;
  permissions?: string[];
  roles?: Array<{ name: string; permissions: string[] }>;
  userType?: string;
  [key: string]: any;
}

export interface RBACConfig {
  permissions: Record<string, any>;
  tenant?: {
    field: string;
    model: string;
  };
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

// Permission Engine Implementation
export class SimplePermissionEngine implements PermissionEngine {
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

// React Context
interface RBACContextType {
  user: User | null;
  config: RBACConfig;
  tenantId?: any;
  engine: PermissionEngine;
}

const RBACContext = createContext<RBACContextType | null>(null);

// Provider Component
interface RBACProviderProps {
  children: ReactNode;
  user: User | null;
  config: RBACConfig;
  tenantId?: any;
}

export function RBACProvider({ children, user, config, tenantId }: RBACProviderProps) {
  const engine = new SimplePermissionEngine(config);
  
  const value: RBACContextType = {
    user,
    config,
    tenantId,
    engine
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
}

// Hook to get RBAC context
export function useRBAC(): RBACContextType {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within RBACProvider');
  }
  return context;
}

// Permission Hooks
export function usePermission(permission: string): boolean {
  const { user, engine, tenantId } = useRBAC();
  return engine.userHasPermission(user, permission, tenantId);
}

export function usePermissions(permissions: string[], requireAll = false): boolean {
  const { user, engine, tenantId } = useRBAC();
  if (requireAll) {
    return engine.userHasAllPermissions(user, permissions, tenantId);
  }
  return engine.userHasAnyPermission(user, permissions, tenantId);
}

// Role Hooks
export function useRole(role: string): boolean {
  const { user, engine, tenantId } = useRBAC();
  return engine.userHasRole(user, role, tenantId);
}

export function useRoles(roles: string[], requireAll = false): boolean {
  const { user, engine, tenantId } = useRBAC();
  if (requireAll) {
    return roles.every(role => engine.userHasRole(user, role, tenantId));
  }
  return engine.userHasAnyRole(user, roles, tenantId);
}

// User Type Hook
export function useUserType(): string | null {
  const { user } = useRBAC();
  return user?.userType || null;
}

// Access Control Component
interface AccessControlProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
  userTypes?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function AccessControl({
  children,
  permissions,
  roles,
  userTypes,
  requireAll = false,
  fallback = null
}: AccessControlProps) {
  const { user, engine, tenantId } = useRBAC();

  // Check permissions
  if (permissions?.length) {
    const hasPermissions = requireAll
      ? engine.userHasAllPermissions(user, permissions, tenantId)
      : engine.userHasAnyPermission(user, permissions, tenantId);
    
    if (!hasPermissions) return <>{fallback}</>;
  }

  // Check roles
  if (roles?.length) {
    const hasRoles = requireAll
      ? roles.every(role => engine.userHasRole(user, role, tenantId))
      : engine.userHasAnyRole(user, roles, tenantId);
    
    if (!hasRoles) return <>{fallback}</>;
  }

  // Check user types
  if (userTypes?.length) {
    const hasUserType = userTypes.includes(user?.userType || '');
    if (!hasUserType) return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Protected Route Component (for react-router-dom)
interface ProtectedRouteProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
  userTypes?: string[];
  requireAll?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  permissions,
  roles,
  userTypes,
  requireAll = false,
  redirectTo = '/unauthorized'
}: ProtectedRouteProps) {
  const { user, engine, tenantId } = useRBAC();

  // Check permissions
  if (permissions?.length) {
    const hasPermissions = requireAll
      ? engine.userHasAllPermissions(user, permissions, tenantId)
      : engine.userHasAnyPermission(user, permissions, tenantId);
    
    if (!hasPermissions) {
      // Return redirect component (assuming react-router-dom)
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return null;
    }
  }

  // Check roles
  if (roles?.length) {
    const hasRoles = requireAll
      ? roles.every(role => engine.userHasRole(user, role, tenantId))
      : engine.userHasAnyRole(user, roles, tenantId);
    
    if (!hasRoles) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return null;
    }
  }

  // Check user types
  if (userTypes?.length) {
    const hasUserType = userTypes.includes(user?.userType || '');
    if (!hasUserType) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return null;
    }
  }

  return <>{children}</>;
}

// Default export with all components and hooks
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
