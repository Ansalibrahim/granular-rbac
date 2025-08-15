import { PermissionEngine } from '../permission-engine';
import { CreateRoleRequest, UpdateRoleRequest, Role, User } from '../types';

export class RoleService {
  private engine: PermissionEngine;
  private RoleModel: any;
  private UserRoleModel: any;

  constructor(
    engine: PermissionEngine,
    models: { Role: any; UserRole: any }
  ) {
    this.engine = engine;
    this.RoleModel = models.Role;
    this.UserRoleModel = models.UserRole;
  }

  /**
   * Create a new role
   */
  async createRole(
    data: CreateRoleRequest,
    tenantId: number,
    createdBy: User
  ): Promise<Role> {
    // Validate permissions
    const { valid, invalid } = this.engine.validatePermissions(data.permissions);
    
    if (invalid.length > 0) {
      throw new Error(`Invalid permissions: ${invalid.join(', ')}`);
    }

    // Check if role name already exists for this tenant
    const existingRole = await this.RoleModel.findOne({
      where: {
        name: data.name,
        [this.engine.getTenantConfig().field]: tenantId,
      },
    });

    if (existingRole) {
      throw new Error('Role with this name already exists for this tenant');
    }

    // Create the role
    const role = await this.RoleModel.create({
      name: data.name,
      description: data.description,
      permissions: valid,
      [this.engine.getTenantConfig().field]: tenantId,
    });

    return role.toJSON();
  }

  /**
   * Get all roles for a tenant
   */
  async getRolesByTenant(tenantId: number): Promise<Role[]> {
    const roles = await this.RoleModel.findAll({
      where: {
        [this.engine.getTenantConfig().field]: tenantId,
      },
      order: [['createdAt', 'DESC']],
    });

    return roles.map((role: any) => role.toJSON());
  }

  /**
   * Get a specific role by ID
   */
  async getRoleById(roleId: number, tenantId: number): Promise<Role | null> {
    const role = await this.RoleModel.findOne({
      where: {
        id: roleId,
        [this.engine.getTenantConfig().field]: tenantId,
      },
    });

    return role ? role.toJSON() : null;
  }

  /**
   * Update a role
   */
  async updateRole(
    roleId: number,
    data: UpdateRoleRequest,
    tenantId: number,
    updatedBy: User
  ): Promise<Role> {
    const role = await this.RoleModel.findOne({
      where: {
        id: roleId,
        [this.engine.getTenantConfig().field]: tenantId,
      },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Validate permissions if provided
    if (data.permissions) {
      const { valid, invalid } = this.engine.validatePermissions(data.permissions);
      
      if (invalid.length > 0) {
        throw new Error(`Invalid permissions: ${invalid.join(', ')}`);
      }
      
      data.permissions = valid;
    }

    // Check for name conflicts if name is being updated
    if (data.name && data.name !== role.name) {
      const existingRole = await this.RoleModel.findOne({
        where: {
          name: data.name,
          [this.engine.getTenantConfig().field]: tenantId,
          id: { [this.RoleModel.sequelize.Sequelize.Op.ne]: roleId },
        },
      });

      if (existingRole) {
        throw new Error('Role with this name already exists for this tenant');
      }
    }

    // Update the role
    await role.update(data);
    await role.reload();

    return role.toJSON();
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId: number, tenantId: number, deletedBy: User): Promise<void> {
    const role = await this.RoleModel.findOne({
      where: {
        id: roleId,
        [this.engine.getTenantConfig().field]: tenantId,
      },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Check if role is assigned to any users
    const userRoleCount = await this.UserRoleModel.count({
      where: { roleId },
    });

    if (userRoleCount > 0) {
      throw new Error('Cannot delete role that is assigned to users');
    }

    await role.destroy();
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(
    userId: number,
    roleId: number,
    tenantId: number,
    assignedBy: User
  ): Promise<void> {
    // Verify role belongs to the tenant
    const role = await this.RoleModel.findOne({
      where: {
        id: roleId,
        [this.engine.getTenantConfig().field]: tenantId,
      },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Check if assignment already exists
    const existingAssignment = await this.UserRoleModel.findOne({
      where: { userId, roleId },
    });

    if (existingAssignment) {
      throw new Error('User already has this role');
    }

    // Create the assignment
    await this.UserRoleModel.create({ userId, roleId });
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(
    userId: number,
    roleId: number,
    tenantId: number,
    removedBy: User
  ): Promise<void> {
    // Verify role belongs to the tenant
    const role = await this.RoleModel.findOne({
      where: {
        id: roleId,
        [this.engine.getTenantConfig().field]: tenantId,
      },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Remove the assignment
    const deleted = await this.UserRoleModel.destroy({
      where: { userId, roleId },
    });

    if (!deleted) {
      throw new Error('User does not have this role');
    }
  }

  /**
   * Get roles for a specific user
   */
  async getUserRoles(userId: number, tenantId: number): Promise<Role[]> {
    const roles = await this.RoleModel.findAll({
      include: [
        {
          model: this.UserRoleModel,
          where: { userId },
        },
      ],
      where: {
        [this.engine.getTenantConfig().field]: tenantId,
      },
    });

    return roles.map((role: any) => role.toJSON());
  }
}
