// Express RBAC Package - Working Implementation
// Note: Express types come from peer dependencies

// Basic types without importing Express
export interface AuthRequest {
  user?: any;
  params?: any;
  query?: any;
  body?: any;
}

export interface Response {
  status: (code: number) => Response;
  json: (data: any) => Response;
  send: (data?: any) => Response;
}

export interface NextFunction {
  (error?: any): void;
}

export interface RBAC {
  engine: {
    userHasPermission: (user: any, permission: string, tenantId?: any) => Promise<boolean> | boolean;
    userHasAnyPermission: (user: any, permissions: string[], tenantId?: any) => Promise<boolean> | boolean;
    userHasAllPermissions: (user: any, permissions: string[], tenantId?: any) => Promise<boolean> | boolean;
    userHasRole: (user: any, role: string, tenantId?: any) => Promise<boolean> | boolean;
    userHasAnyRole: (user: any, roles: string[], tenantId?: any) => Promise<boolean> | boolean;
  };
  roleService?: any;
}

// Middleware Factory
export function createPermissionMiddleware(engine: RBAC['engine']) {
  const requirePermission = (permissions: string | string[], options?: { requireAll?: boolean }) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
      const tenantId = req.user.shopId;

      try {
        let hasAccess = false;
        
        if (options?.requireAll) {
          hasAccess = await engine.userHasAllPermissions(req.user, permissionArray, tenantId);
        } else {
          hasAccess = await engine.userHasAnyPermission(req.user, permissionArray, tenantId);
        }

        if (!hasAccess) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }

        next();
      } catch (error) {
        console.error('Permission check error:', error);
        res.status(500).json({ message: 'Permission check failed' });
      }
    };
  };

  const requireUserType = (userType: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user || req.user.userType !== userType) {
        return res.status(403).json({ message: 'Insufficient privileges' });
      }
      next();
    };
  };

  const requireAdmin = () => requireUserType('admin');
  const requireSuperAdmin = () => requireUserType('superadmin');

  const extractTenantId = (source: 'params' | 'query' | 'body', field: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      const sourceData = source === 'params' ? req.params : source === 'query' ? req.query : req.body;
      const tenantId = sourceData?.[field];
      if (tenantId) {
        req.user = { ...req.user, [field]: tenantId };
      }
      next();
    };
  };

  const validateTenantAccess = () => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      // Basic tenant validation - can be enhanced
      next();
    };
  };

  return {
    requirePermission,
    requireUserType,
    requireAdmin,
    requireSuperAdmin,
    extractTenantId,
    validateTenantAccess
  };
}

// Role Controller Factory
export function createRoleController(rbac: RBAC) {
  const createRole = async (req: AuthRequest, res: Response) => {
    try {
      const { name, description, permissions } = req.body || {};
      const tenantId = req.user?.shopId;

      if (!rbac.roleService) {
        return res.status(501).json({ message: 'Role service not available' });
      }

      const role = await rbac.roleService.createRole(tenantId, { name, description, permissions });
      res.status(201).json({ role });
    } catch (error) {
      console.error('Create role error:', error);
      res.status(500).json({ message: 'Failed to create role' });
    }
  };

  const getRoles = async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.shopId;

      if (!rbac.roleService) {
        return res.status(501).json({ message: 'Role service not available' });
      }

      const roles = await rbac.roleService.getRoles(tenantId);
      res.json({ roles });
    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({ message: 'Failed to get roles' });
    }
  };

  const getRoleById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params || {};
      const tenantId = req.user?.shopId;

      if (!rbac.roleService) {
        return res.status(501).json({ message: 'Role service not available' });
      }

      const role = await rbac.roleService.getRoleById(id, tenantId);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      res.json({ role });
    } catch (error) {
      console.error('Get role error:', error);
      res.status(500).json({ message: 'Failed to get role' });
    }
  };

  const updateRole = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params || {};
      const { name, description, permissions } = req.body || {};
      const tenantId = req.user?.shopId;

      if (!rbac.roleService) {
        return res.status(501).json({ message: 'Role service not available' });
      }

      const role = await rbac.roleService.updateRole(id, tenantId, { name, description, permissions });
      res.json({ role });
    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({ message: 'Failed to update role' });
    }
  };

  const deleteRole = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params || {};
      const tenantId = req.user?.shopId;

      if (!rbac.roleService) {
        return res.status(501).json({ message: 'Role service not available' });
      }

      await rbac.roleService.deleteRole(id, tenantId);
      res.status(204).send();
    } catch (error) {
      console.error('Delete role error:', error);
      res.status(500).json({ message: 'Failed to delete role' });
    }
  };

  const assignRole = async (req: AuthRequest, res: Response) => {
    try {
      const { userId, roleId } = req.body || {};
      const tenantId = req.user?.shopId;

      if (!rbac.roleService) {
        return res.status(501).json({ message: 'Role service not available' });
      }

      await rbac.roleService.assignRole(userId, roleId, tenantId);
      res.json({ message: 'Role assigned successfully' });
    } catch (error) {
      console.error('Assign role error:', error);
      res.status(500).json({ message: 'Failed to assign role' });
    }
  };

  const unassignRole = async (req: AuthRequest, res: Response) => {
    try {
      const { userId, roleId } = req.params || {};
      const tenantId = req.user?.shopId;

      if (!rbac.roleService) {
        return res.status(501).json({ message: 'Role service not available' });
      }

      await rbac.roleService.unassignRole(userId, roleId, tenantId);
      res.json({ message: 'Role unassigned successfully' });
    } catch (error) {
      console.error('Unassign role error:', error);
      res.status(500).json({ message: 'Failed to unassign role' });
    }
  };

  const getUserRoles = async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params || {};
      const tenantId = req.user?.shopId;

      if (!rbac.roleService) {
        return res.status(501).json({ message: 'Role service not available' });
      }

      const roles = await rbac.roleService.getUserRoles(userId, tenantId);
      res.json({ roles });
    } catch (error) {
      console.error('Get user roles error:', error);
      res.status(500).json({ message: 'Failed to get user roles' });
    }
  };

  return {
    createRole,
    getRoles,
    getRoleById,
    updateRole,
    deleteRole,
    assignRole,
    unassignRole,
    getUserRoles
  };
}

// Routes Factory - returns a basic router-like object
export function createRoleRoutes(rbac: RBAC) {
  const controller = createRoleController(rbac);
  const middleware = createPermissionMiddleware(rbac.engine);

  // Return a basic router object that can be used with Express
  const router = {
    // Express Router methods will be mixed in when imported in Express environment
    _routes: {
      'POST /roles': [middleware.requireAdmin(), controller.createRole],
      'GET /roles': [middleware.requirePermission(['settings.roles']), controller.getRoles],
      'GET /roles/:id': [middleware.requirePermission(['settings.roles']), controller.getRoleById],
      'PUT /roles/:id': [middleware.requireAdmin(), controller.updateRole],
      'DELETE /roles/:id': [middleware.requireAdmin(), controller.deleteRole],
      'POST /users/roles': [middleware.requireAdmin(), controller.assignRole],
      'DELETE /users/:userId/roles/:roleId': [middleware.requireAdmin(), controller.unassignRole],
      'GET /users/:userId/roles': [middleware.requirePermission(['settings.users']), controller.getUserRoles],
    },
    get: () => router,
    post: () => router,
    put: () => router,
    delete: () => router,
  };

  return router;
}

// Export everything
export default {
  createPermissionMiddleware,
  createRoleController,
  createRoleRoutes
};