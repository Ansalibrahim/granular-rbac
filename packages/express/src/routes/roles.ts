import { Router } from 'express';
import { RBAC } from 'granular-rbac-core';
import { createPermissionMiddleware } from '../middleware/auth';
import { createRoleController } from '../controllers/roles';

export function createRoleRoutes(rbac: RBAC) {
  const router = Router();
  const middleware = createPermissionMiddleware(rbac.engine);
  const controller = createRoleController(rbac);

  // Extract tenant ID from params for all routes
  router.use('/:tenantId/*', middleware.extractTenantId('params', 'tenantId'));
  router.use('/:tenantId/*', middleware.validateTenantAccess());

  // Get all available permissions (Admin+)
  router.get('/:tenantId/permissions', middleware.requireAdmin(), controller.getPermissions);

  // Role management routes (Admin+)
  router.post('/:tenantId', middleware.requireAdmin(), controller.createRole);
  router.get('/:tenantId', middleware.requireAdmin(), controller.getRoles);
  router.get('/:tenantId/:id', middleware.requireAdmin(), controller.getRole);
  router.put('/:tenantId/:id', middleware.requireAdmin(), controller.updateRole);
  router.delete('/:tenantId/:id', middleware.requireAdmin(), controller.deleteRole);

  // User role assignment routes (Admin+)
  router.post('/:tenantId/assign', middleware.requireAdmin(), controller.assignRoleToUser);
  router.delete('/:tenantId/users/:userId/roles/:roleId', middleware.requireAdmin(), controller.removeRoleFromUser);
  router.get('/:tenantId/users/:userId', middleware.requireAdmin(), controller.getUserRoles);

  return router;
}
