export { RBAC } from './rbac';
export { PermissionEngine } from './permission-engine';
export { RoleService } from './services/role-service';
export { createModels, createRoleModel, createUserRoleModel } from './models';

export type {
  Permission,
  PermissionModule,
  RBACConfig,
  User,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRoleRequest,
  UserType,
  PermissionValidationResult,
  UserPermissionCheck,
} from './types';
