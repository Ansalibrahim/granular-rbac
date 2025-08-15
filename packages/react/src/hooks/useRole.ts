import { useRBAC } from '../context';

export function useRole(roleName: string) {
  const { hasRole } = useRBAC();
  return hasRole(roleName);
}

export function useRoles(roleNames: string[], requireAll: boolean = false) {
  const { hasRole, hasAnyRole } = useRBAC();
  
  if (requireAll) {
    return roleNames.every(role => hasRole(role));
  }
  
  return hasAnyRole(roleNames);
}

export function useUserType() {
  const { user, isAdmin, isSuperAdmin, canBypassPermissions } = useRBAC();
  
  return {
    userType: user?.userType || 'user',
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
    canBypassPermissions: canBypassPermissions(),
    isRegularUser: user?.userType === 'user'
  };
}
