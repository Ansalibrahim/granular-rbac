import React, { createContext, useContext, ReactNode } from 'react';
// import { PermissionEngine, User, RBACConfig } from 'granular-rbac-core';

// Temporary local type definitions for compilation
export interface User {
  id: number;
  permissions?: string[];
  roles?: Array<{ name: string; permissions: string[] }>;
  userType?: string;
  [key: string]: any;
}

export interface PermissionEngine {
  validatePermission(permission: string): boolean;
  userHasPermission(user: User | null, permission: string, tenantId?: any): boolean;
  userHasAnyPermission(user: User | null, permissions: string[], tenantId?: any): boolean;
  userHasAllPermissions(user: User | null, permissions: string[], tenantId?: any): boolean;
  userHasRole(user: User | null, role: string, tenantId?: any): boolean;
  userHasAnyRole(user: User | null, roles: string[], tenantId?: any): boolean;
}

export interface RBACConfig {
  permissions: Record<string, any[]>;
  tenant: {
    field: string;
    modelName: string;
  };
}

interface RBACContextValue {
  user: User | null;
  engine: PermissionEngine;
  hasPermission: (permission: string) => Promise<boolean>;
  hasAnyPermission: (permissions: string[]) => Promise<boolean>;
  hasAllPermissions: (permissions: string[]) => Promise<boolean>;
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  canBypassPermissions: () => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  getUserPermissions: () => Promise<string[]>;
}

const RBACContext = createContext<RBACContextValue | null>(null);

interface RBACProviderProps {
  children: ReactNode;
  user: User | null;
  config: RBACConfig;
  tenantId?: number;
}

export function RBACProvider({ children, user, config, tenantId }: RBACProviderProps) {
  const engine = new PermissionEngine(config);
  
  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!user) return false;
    return engine.userHasPermission(user, permission, tenantId);
  };

  const hasAnyPermission = async (permissions: string[]): Promise<boolean> => {
    if (!user) return false;
    return engine.userHasAnyPermission(user, permissions, tenantId);
  };

  const hasAllPermissions = async (permissions: string[]): Promise<boolean> => {
    if (!user) return false;
    return engine.userHasAllPermissions(user, permissions, tenantId);
  };

  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    return engine.userHasRole(user, roleName);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    if (!user) return false;
    return engine.userHasAnyRole(user, roleNames);
  };

  const canBypassPermissions = (): boolean => {
    if (!user) return false;
    return engine.userCanBypassPermissions(user);
  };

  const isAdmin = (): boolean => {
    return user?.userType === 'admin' || user?.userType === 'superadmin';
  };

  const isSuperAdmin = (): boolean => {
    return user?.userType === 'superadmin';
  };

  const getUserPermissions = async (): Promise<string[]> => {
    if (!user) return [];
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
