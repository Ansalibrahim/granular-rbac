import React, { useState, useEffect, ReactNode } from 'react';
import { useRBAC } from '../context';

interface AccessControlProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
  fallback?: ReactNode;
  requireAll?: boolean; // Require all permissions vs any permission
  showLoader?: boolean;
  loaderComponent?: ReactNode;
}

export function AccessControl({ 
  children, 
  permissions, 
  roles,
  fallback = null,
  requireAll = false,
  showLoader = false,
  loaderComponent = null
}: AccessControlProps) {
  const { 
    user, 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    hasRole,
    hasAnyRole
  } = useRBAC();
  
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAccess() {
      setLoading(true);
      
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // If no restrictions, allow access
      if (!permissions && !roles) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      let permissionAccess = true;
      let roleAccess = true;
      
      // Check permissions
      if (permissions && permissions.length > 0) {
        if (requireAll) {
          permissionAccess = await hasAllPermissions(permissions);
        } else {
          permissionAccess = await hasAnyPermission(permissions);
        }
      }

      // Check roles
      if (roles && roles.length > 0) {
        if (requireAll) {
          roleAccess = roles.every(role => hasRole(role));
        } else {
          roleAccess = hasAnyRole(roles);
        }
      }

      // Both permission and role checks must pass
      setHasAccess(permissionAccess && roleAccess);
      setLoading(false);
    }

    checkAccess();
  }, [user, permissions, roles, requireAll, hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole]);

  if (loading) {
    if (showLoader) {
      return loaderComponent ? <>{loaderComponent}</> : <div>Loading...</div>;
    }
    return null;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
