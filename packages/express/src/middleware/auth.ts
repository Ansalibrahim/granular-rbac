import { Request, Response, NextFunction } from 'express';
import { PermissionEngine, User } from 'granular-rbac-core';

export interface AuthRequest extends Request {
  user?: User;
  tenantId?: number;
}

export function createPermissionMiddleware(engine: PermissionEngine) {
  /**
   * Middleware to require specific permissions
   */
  function requirePermission(permission: string | string[], options?: { requireAll?: boolean }) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const permissions = Array.isArray(permission) ? permission : [permission];
      const requireAll = options?.requireAll || false;

      let hasAccess: boolean;
      
      if (requireAll) {
        hasAccess = await engine.userHasAllPermissions(req.user, permissions, req.tenantId);
      } else {
        hasAccess = await engine.userHasAnyPermission(req.user, permissions, req.tenantId);
      }

      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: permissions,
          requireAll
        });
      }

      next();
    };
  }

  /**
   * Middleware to require specific user types
   */
  function requireUserType(userType: 'superadmin' | 'admin' | 'user') {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      if (req.user.userType !== userType) {
        return res.status(403).json({ 
          error: `${userType} access required`,
          code: 'INSUFFICIENT_USER_TYPE',
          required: userType,
          current: req.user.userType
        });
      }

      next();
    };
  }

  /**
   * Middleware to require admin or superadmin access
   */
  function requireAdmin() {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
        return res.status(403).json({ 
          error: 'Admin access required',
          code: 'ADMIN_ACCESS_REQUIRED',
          current: req.user.userType
        });
      }

      next();
    };
  }

  /**
   * Middleware to require superadmin access
   */
  function requireSuperAdmin() {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      if (req.user.userType !== 'superadmin') {
        return res.status(403).json({ 
          error: 'SuperAdmin access required',
          code: 'SUPERADMIN_ACCESS_REQUIRED',
          current: req.user.userType
        });
      }

      next();
    };
  }

  /**
   * Middleware to extract tenant ID from request
   */
  function extractTenantId(source: 'params' | 'query' | 'body' = 'params', field: string = 'tenantId') {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      const tenantId = req[source]?.[field];
      
      if (tenantId) {
        req.tenantId = parseInt(tenantId as string, 10);
      }
      
      next();
    };
  }

  /**
   * Middleware to validate tenant access
   */
  function validateTenantAccess() {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Superadmin can access any tenant
      if (req.user.userType === 'superadmin') {
        return next();
      }

      // Check if user belongs to the requested tenant
      if (req.tenantId && req.user[engine.getTenantConfig().field] !== req.tenantId) {
        return res.status(403).json({ 
          error: 'Access denied to this tenant',
          code: 'TENANT_ACCESS_DENIED',
          requestedTenant: req.tenantId,
          userTenant: req.user[engine.getTenantConfig().field]
        });
      }

      next();
    };
  }

  return {
    requirePermission,
    requireUserType,
    requireAdmin,
    requireSuperAdmin,
    extractTenantId,
    validateTenantAccess
  };
}
