import React, { ReactNode } from 'react';
import { useRBAC } from '../context';

interface AccessControlProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
  fallback?: ReactNode;
  requireAll?: boolean;
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
  loaderComponent = <div>Loading...</div>
}: AccessControlProps) {
  const { hasAnyPermission, hasAllPermissions, hasAnyRole, canBypassPermissions } = useRBAC();
  
  if (showLoader) {
    return <>{loaderComponent}</>;
  }

  // If user can bypass permissions, always allow access
  if (canBypassPermissions()) {
    return <>{children}</>;
  }

  let hasAccess = false;

  // Check permissions
  if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  }

  // Check roles
  if (roles && roles.length > 0) {
    const roleAccess = hasAnyRole(roles);
    if (permissions && permissions.length > 0) {
      hasAccess = requireAll ? (hasAccess && roleAccess) : (hasAccess || roleAccess);
    } else {
      hasAccess = roleAccess;
    }
  }

  // If no permissions or roles specified, allow access
  if ((!permissions || permissions.length === 0) && (!roles || roles.length === 0)) {
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}