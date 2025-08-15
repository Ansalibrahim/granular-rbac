import { Response } from 'express';
import { RBAC } from 'granular-rbac-core';
import { AuthRequest } from '../middleware/auth';

export function createRoleController(rbac: RBAC) {
  /**
   * Create a new role
   */
  const createRole = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, description, permissions } = req.body;
      const { user, tenantId } = req;

      if (!user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      // Validate required fields
      if (!name) {
        res.status(400).json({ error: 'Role name is required' });
        return;
      }

      const role = await rbac.createRole(
        { name, description, permissions: permissions || [] },
        tenantId,
        user
      );

      res.status(201).json({
        message: 'Role created successfully',
        role
      });
    } catch (error: any) {
      console.error('Error creating role:', error);
      res.status(500).json({ 
        error: error.message || 'Internal server error' 
      });
    }
  };

  /**
   * Get all roles for a tenant
   */
  const getRoles = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { tenantId } = req;

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      const roles = await rbac.getRolesByTenant(tenantId);

      res.status(200).json({
        roles: roles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt
        }))
      });
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ 
        error: error.message || 'Internal server error' 
      });
    }
  };

  /**
   * Get a specific role by ID
   */
  const getRole = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { tenantId } = req;

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      const roleId = parseInt(id, 10);
      if (isNaN(roleId)) {
        res.status(400).json({ error: 'Invalid role ID' });
        return;
      }

      const role = await rbac.getRoleById(roleId, tenantId);

      if (!role) {
        res.status(404).json({ error: 'Role not found' });
        return;
      }

      res.status(200).json({ role });
    } catch (error: any) {
      console.error('Error fetching role:', error);
      res.status(500).json({ 
        error: error.message || 'Internal server error' 
      });
    }
  };

  /**
   * Update a role
   */
  const updateRole = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, permissions } = req.body;
      const { user, tenantId } = req;

      if (!user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      const roleId = parseInt(id, 10);
      if (isNaN(roleId)) {
        res.status(400).json({ error: 'Invalid role ID' });
        return;
      }

      const role = await rbac.updateRole(
        roleId,
        { name, description, permissions },
        tenantId,
        user
      );

      res.status(200).json({
        message: 'Role updated successfully',
        role
      });
    } catch (error: any) {
      console.error('Error updating role:', error);
      res.status(500).json({ 
        error: error.message || 'Internal server error' 
      });
    }
  };

  /**
   * Delete a role
   */
  const deleteRole = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { user, tenantId } = req;

      if (!user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      const roleId = parseInt(id, 10);
      if (isNaN(roleId)) {
        res.status(400).json({ error: 'Invalid role ID' });
        return;
      }

      await rbac.deleteRole(roleId, tenantId, user);

      res.status(200).json({
        message: 'Role deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting role:', error);
      res.status(500).json({ 
        error: error.message || 'Internal server error' 
      });
    }
  };

  /**
   * Assign role to user
   */
  const assignRoleToUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId, roleId } = req.body;
      const { user, tenantId } = req;

      if (!user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      if (!userId || !roleId) {
        res.status(400).json({ error: 'User ID and Role ID are required' });
        return;
      }

      await rbac.assignRoleToUser(userId, roleId, tenantId, user);

      res.status(200).json({
        message: 'Role assigned to user successfully'
      });
    } catch (error: any) {
      console.error('Error assigning role to user:', error);
      res.status(500).json({ 
        error: error.message || 'Internal server error' 
      });
    }
  };

  /**
   * Remove role from user
   */
  const removeRoleFromUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId, roleId } = req.params;
      const { user, tenantId } = req;

      if (!user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      const userIdNum = parseInt(userId, 10);
      const roleIdNum = parseInt(roleId, 10);

      if (isNaN(userIdNum) || isNaN(roleIdNum)) {
        res.status(400).json({ error: 'Invalid user ID or role ID' });
        return;
      }

      await rbac.removeRoleFromUser(userIdNum, roleIdNum, tenantId, user);

      res.status(200).json({
        message: 'Role removed from user successfully'
      });
    } catch (error: any) {
      console.error('Error removing role from user:', error);
      res.status(500).json({ 
        error: error.message || 'Internal server error' 
      });
    }
  };

  /**
   * Get user roles
   */
  const getUserRoles = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { tenantId } = req;

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      const userIdNum = parseInt(userId, 10);
      if (isNaN(userIdNum)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const roles = await rbac.getUserRoles(userIdNum, tenantId);

      res.status(200).json({ roles });
    } catch (error: any) {
      console.error('Error fetching user roles:', error);
      res.status(500).json({ 
        error: error.message || 'Internal server error' 
      });
    }
  };

  /**
   * Get all available permissions
   */
  const getPermissions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const permissions = rbac.engine.getPermissionsConfig();
      const allPermissions = rbac.engine.getAllPermissions();
      const permissionShortNames = rbac.engine.getAllPermissionShortNames();

      res.status(200).json({
        permissions,
        allPermissions,
        permissionShortNames
      });
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({ 
        error: error.message || 'Internal server error' 
      });
    }
  };

  return {
    createRole,
    getRoles,
    getRole,
    updateRole,
    deleteRole,
    assignRoleToUser,
    removeRoleFromUser,
    getUserRoles,
    getPermissions
  };
}
