export { createPermissionMiddleware } from './middleware/auth';
export { createRoleController } from './controllers/roles';
export { createRoleRoutes } from './routes/roles';

export type { AuthRequest } from './middleware/auth';

// Re-export types from core
// export type {
//   Permission,
//   RBACConfig,
//   User,
//   Role,
//   UserType,
//   CreateRoleRequest,
//   UpdateRoleRequest,
// } from 'granular-rbac-core';
