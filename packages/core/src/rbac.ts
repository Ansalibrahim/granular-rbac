import { Sequelize } from 'sequelize';
import { PermissionEngine } from './permission-engine';
import { RoleService } from './services/role-service';
import { createModels } from './models';
import { RBACConfig, User, Role, CreateRoleRequest, UpdateRoleRequest } from './types';

export class RBAC {
  public engine: PermissionEngine;
  public roleService: RoleService;
  private models: any;
  private sequelize: Sequelize;

  constructor(config: RBACConfig, sequelize: Sequelize) {
    this.sequelize = sequelize;
    this.engine = new PermissionEngine(config);
    this.models = createModels(sequelize, config);
    this.roleService = new RoleService(this.engine, this.models);
  }

  /**
   * Initialize the RBAC system (run migrations, etc.)
   */
  async initialize(): Promise<void> {
    await this.sequelize.sync();
  }

  /**
   * Get the Sequelize models
   */
  getModels() {
    return this.models;
  }

  /**
   * Get user with roles and permissions populated
   */
  async getUserWithPermissions(userId: number, tenantId: number): Promise<User | null> {
    const UserModel = this.sequelize.models.User;
    
    if (!UserModel) {
      throw new Error('User model not found. Make sure to define User model in your Sequelize instance.');
    }

    const user = await UserModel.findByPk(userId, {
      include: [
        {
          model: this.models.Role,
          as: 'roles',
          through: { attributes: [] },
          where: {
            [this.engine.getTenantConfig().field]: tenantId,
          },
          required: false,
        },
      ],
    });

    if (!user) {
      return null;
    }

    const userData = user.toJSON() as User;

    // Flatten permissions from all roles
    if (userData.roles) {
      const allPermissions = new Set<string>();
      userData.roles.forEach(role => {
        role.permissions.forEach(permission => allPermissions.add(permission));
      });
      userData.permissions = Array.from(allPermissions);
    }

    return userData;
  }

  /**
   * Check if user has permission
   */
  async userHasPermission(
    user: User,
    permission: string,
    tenantId?: number
  ): Promise<boolean> {
    return this.engine.userHasPermission(user, permission, tenantId);
  }

  /**
   * Check if user has any of the permissions
   */
  async userHasAnyPermission(
    user: User,
    permissions: string[],
    tenantId?: number
  ): Promise<boolean> {
    return this.engine.userHasAnyPermission(user, permissions, tenantId);
  }

  /**
   * Check if user has all permissions
   */
  async userHasAllPermissions(
    user: User,
    permissions: string[],
    tenantId?: number
  ): Promise<boolean> {
    return this.engine.userHasAllPermissions(user, permissions, tenantId);
  }

  /**
   * Get all permissions for user
   */
  async getUserPermissions(user: User): Promise<string[]> {
    return this.engine.getUserPermissions(user);
  }

  // Role management methods
  async createRole(data: CreateRoleRequest, tenantId: number, createdBy: User): Promise<Role> {
    return this.roleService.createRole(data, tenantId, createdBy);
  }

  async getRolesByTenant(tenantId: number): Promise<Role[]> {
    return this.roleService.getRolesByTenant(tenantId);
  }

  async getRoleById(roleId: number, tenantId: number): Promise<Role | null> {
    return this.roleService.getRoleById(roleId, tenantId);
  }

  async updateRole(roleId: number, data: UpdateRoleRequest, tenantId: number, updatedBy: User): Promise<Role> {
    return this.roleService.updateRole(roleId, data, tenantId, updatedBy);
  }

  async deleteRole(roleId: number, tenantId: number, deletedBy: User): Promise<void> {
    return this.roleService.deleteRole(roleId, tenantId, deletedBy);
  }

  async assignRoleToUser(userId: number, roleId: number, tenantId: number, assignedBy: User): Promise<void> {
    return this.roleService.assignRoleToUser(userId, roleId, tenantId, assignedBy);
  }

  async removeRoleFromUser(userId: number, roleId: number, tenantId: number, removedBy: User): Promise<void> {
    return this.roleService.removeRoleFromUser(userId, roleId, tenantId, removedBy);
  }

  async getUserRoles(userId: number, tenantId: number): Promise<Role[]> {
    return this.roleService.getUserRoles(userId, tenantId);
  }
}
