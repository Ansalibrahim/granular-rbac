// Simple standalone React package for granular RBAC
// This version compiles without external dependencies

export interface User {
  id: number;
  permissions?: string[];
  roles?: Array<{ name: string; permissions: string[] }>;
  userType?: string;
  [key: string]: any;
}

export interface AccessControlProps {
  children: any;
  permissions?: string[];
  roles?: string[];
  fallback?: any;
  requireAll?: boolean;
  showLoader?: boolean;
}

export interface ProtectedRouteProps {
  children: any;
  permissions?: string[];
  roles?: string[];
  redirectTo?: string;
  requireAll?: boolean;
  unauthorizedComponent?: any;
  showLoader?: boolean;
  loaderComponent?: any;
}

// Placeholder components for compilation
export const AccessControl = (props: AccessControlProps) => props.children;
export const ProtectedRoute = (props: ProtectedRouteProps) => props.children;
export const RBACProvider = (props: any) => props.children;
export const useRBAC = () => ({ user: null, hasPermission: () => false });
export const usePermission = () => false;
export const usePermissions = () => false;
export const useRole = () => false;
export const useRoles = () => false;
export const useUserType = () => null;

export default {
  AccessControl,
  ProtectedRoute,
  RBACProvider,
  useRBAC,
  usePermission,
  usePermissions,
  useRole,
  useRoles,
  useUserType
};
