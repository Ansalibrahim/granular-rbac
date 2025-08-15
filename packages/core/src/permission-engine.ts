import { Permission, RBACConfig, User, Role, PermissionValidationResult } from './types';

export class PermissionEngine {
  private config: RBACConfig;
  private allPermissions: Permission[];

  constructor(config: RBACConfig) {
    this.config = config;
    this.allPermissions = Object.values(config.permissions).flat();
  }

  /**
   * Validate if a permission exists in the system
   */
  validatePermission(shortName: string): boolean {
    return this.allPermissions.some(p => p.shortName === shortName);
  }

  /**
   * Validate multiple permissions
   */
  validatePermissions(shortNames: string[]): PermissionValidationResult {
    const valid: string[] = [];
    const invalid: string[] = [];

    shortNames.forEach(shortName => {
      if (this.validatePermission(shortName)) {
        valid.push(shortName);
      } else {
        invalid.push(shortName);
      }
    });

    return { valid, invalid };
  }

  /**
   * Get all permissions in the system
   */
  getAllPermissions(): Permission[] {
    return [...this.allPermissions];
  }

  /**
   * Get all permission short names
   */
  getAllPermissionShortNames(): string[] {
    return this.allPermissions.map(p => p.shortName);
  }

  /**
   * Get permissions by module
   */
  getPermissionsByModule(module: string): Permission[] {
    return this.config.permissions[module] || [];
  }

  /**
   * Get permission object by short name
   */
  getPermissionByShortName(shortName: string): Permission | undefined {
    return this.allPermissions.find(p => p.shortName === shortName);
  }

  /**
   * Check if user has a specific permission
   */
  async userHasPermission(
    user: User, 
    permissionShortName: string,
    tenantId?: number
  ): Promise<boolean> {
    if (!user) return false;

    // Superadmin can access everything
    if (user.userType === 'superadmin') {
      return true;
    }

    // Admin can access everything within their tenant
    if (user.userType === 'admin') {
      const userTenantId = user[this.config.tenant.field];
      if (!tenantId || userTenantId === tenantId) {
        return true;
      }
    }

    // Check user's permissions (from roles)
    const userPermissions = user.permissions || [];
    return userPermissions.includes(permissionShortName);
  }

  /**
   * Check if user has any of the specified permissions
   */
  async userHasAnyPermission(
    user: User,
    permissionShortNames: string[],
    tenantId?: number
  ): Promise<boolean> {
    for (const permission of permissionShortNames) {
      if (await this.userHasPermission(user, permission, tenantId)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if user has all of the specified permissions
   */
  async userHasAllPermissions(
    user: User,
    permissionShortNames: string[],
    tenantId?: number
  ): Promise<boolean> {
    for (const permission of permissionShortNames) {
      if (!(await this.userHasPermission(user, permission, tenantId))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(user: User): Promise<string[]> {
    if (!user) return [];

    // Superadmin gets all permissions
    if (user.userType === 'superadmin') {
      return this.getAllPermissionShortNames();
    }

    // Admin gets all permissions
    if (user.userType === 'admin') {
      return this.getAllPermissionShortNames();
    }

    // Regular users get permissions from their roles
    return user.permissions || [];
  }

  /**
   * Check if user can bypass permissions
   */
  userCanBypassPermissions(user: User): boolean {
    return user.userType === 'superadmin' || user.userType === 'admin';
  }

  /**
   * Get user's roles
   */
  getUserRoles(user: User): Role[] {
    return user.roles || [];
  }

  /**
   * Check if user has a specific role
   */
  userHasRole(user: User, roleName: string): boolean {
    return this.getUserRoles(user).some(role => role.name === roleName);
  }

  /**
   * Check if user has any of the specified roles
   */
  userHasAnyRole(user: User, roleNames: string[]): boolean {
    const userRoles = this.getUserRoles(user);
    return roleNames.some(roleName => 
      userRoles.some(role => role.name === roleName)
    );
  }

  /**
   * Get the tenant configuration
   */
  getTenantConfig() {
    return this.config.tenant;
  }

  /**
   * Get the permissions configuration
   */
  getPermissionsConfig() {
    return this.config.permissions;
  }
}
