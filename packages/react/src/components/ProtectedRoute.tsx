import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AccessControl } from './AccessControl';

interface ProtectedRouteProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
  requireAll?: boolean;
  redirectTo?: string;
  showLoader?: boolean;
  loaderComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
}

export function ProtectedRoute({
  children,
  permissions,
  roles,
  requireAll = false,
  redirectTo = '/unauthorized',
  showLoader = true,
  loaderComponent,
  unauthorizedComponent
}: ProtectedRouteProps) {
  const fallback = unauthorizedComponent || <Navigate to={redirectTo} replace />;

  return (
    <AccessControl
      permissions={permissions}
      roles={roles}
      requireAll={requireAll}
      fallback={fallback}
      showLoader={showLoader}
      loaderComponent={loaderComponent}
    >
      {children}
    </AccessControl>
  );
}
