export { RBACProvider, useRBAC } from './context';
export { AccessControl, ProtectedRoute } from './components';
export { usePermission, usePermissions, useRole, useRoles, useUserType } from './hooks';

// Re-export types from core (commented out for standalone compilation)
// export type {
//   Permission,
//   RBACConfig,
//   User,
//   Role,
//   UserType,
// } from 'granular-rbac-core';
