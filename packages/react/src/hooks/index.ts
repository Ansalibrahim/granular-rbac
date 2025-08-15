import { useRBAC } from '../context';

export function usePermission(permission: string): boolean {
  const { hasPermission } = useRBAC();
  return hasPermission(permission);
}

export function usePermissions(permissions: string[], requireAll = false): boolean {
  const { hasAnyPermission, hasAllPermissions } = useRBAC();
  return requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
}

export function useRole(role: string): boolean {
  const { hasRole } = useRBAC();
  return hasRole(role);
}

export function useRoles(roles: string[], requireAll = false): boolean {
  const { hasAnyRole } = useRBAC();
  // For roles, we typically check if user has ANY of the roles
  return hasAnyRole(roles);
}

export function useUserType(): string | null {
  const { user } = useRBAC();
  return user?.userType || null;
}

export function useCanBypass(): boolean {
  const { canBypassPermissions } = useRBAC();
  return canBypassPermissions();
}

export function useIsAdmin(): boolean {
  const { isAdmin } = useRBAC();
  return isAdmin();
}

export function useIsSuperAdmin(): boolean {
  const { isSuperAdmin } = useRBAC();
  return isSuperAdmin();
}

export function useUserPermissions(): string[] {
  const { getUserPermissions } = useRBAC();
  return getUserPermissions();
}