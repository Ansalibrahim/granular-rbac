import React, { ReactNode } from 'react';
import { useRBAC } from '../context';

interface ProtectedRouteProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
  requireAll?: boolean;
  redirectTo?: string;
  unauthorizedComponent?: ReactNode;
  showLoader?: boolean;
  loaderComponent?: ReactNode;
}

export function ProtectedRoute({
  children,
  permissions,
  roles,
  requireAll = false,
  redirectTo = '/unauthorized',
  unauthorizedComponent,
  showLoader = false,
  loaderComponent = <div>Loading...</div>
}: ProtectedRouteProps) {
  const { user, hasAnyPermission, hasAllPermissions, hasAnyRole, canBypassPermissions } = useRBAC();

  if (showLoader) {
    return <>{loaderComponent}</>;
  }

  // Check if user is authenticated
  if (!user) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }
    // In a real React Router environment, this would redirect
    // For now, we'll just show unauthorized message
    return <div>Unauthorized - Please login</div>;
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

  // If no permissions or roles specified, allow access for authenticated users
  if ((!permissions || permissions.length === 0) && (!roles || roles.length === 0)) {
    hasAccess = true;
  }

  if (!hasAccess) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }
    return <div>Access Denied - Insufficient permissions</div>;
  }

  return <>{children}</>;
}