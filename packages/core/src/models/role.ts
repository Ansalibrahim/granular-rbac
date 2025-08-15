import { Model, DataTypes, Sequelize, Association } from 'sequelize';
import { RBACConfig } from '../types';

export function createRoleModel(sequelize: Sequelize, config: RBACConfig) {
  class Role extends Model {
    public id!: number;
    public name!: string;
    public description?: string;
    public permissions!: string[];
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    
    // Dynamic tenant field
    [key: string]: any;

    // Associations
    public users?: any[];
    public static associations: {
      users: Association<Role, any>;
    };

    /**
     * Check if role has a specific permission
     */
    public hasPermission(permissionShortName: string): boolean {
      return this.permissions.includes(permissionShortName);
    }

    /**
     * Add permission to role
     */
    public addPermission(permissionShortName: string): void {
      if (!this.hasPermission(permissionShortName)) {
        this.permissions.push(permissionShortName);
      }
    }

    /**
     * Remove permission from role
     */
    public removePermission(permissionShortName: string): void {
      this.permissions = this.permissions.filter(p => p !== permissionShortName);
    }

    /**
     * Get all permissions for this role
     */
    public getPermissions(): string[] {
      return [...this.permissions];
    }

    /**
     * Set multiple permissions
     */
    public setPermissions(permissionShortNames: string[]): void {
      this.permissions = [...permissionShortNames];
    }

    /**
     * Check if role has any of the specified permissions
     */
    public hasAnyPermission(permissionShortNames: string[]): boolean {
      return permissionShortNames.some(permission => this.hasPermission(permission));
    }

    /**
     * Check if role has all of the specified permissions
     */
    public hasAllPermissions(permissionShortNames: string[]): boolean {
      return permissionShortNames.every(permission => this.hasPermission(permission));
    }
  }

  Role.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      [config.tenant.field]: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: config.tenant.model.toLowerCase() + 's',
          key: 'id',
        },
      },
      permissions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'roles', // Use existing table name
      underscored: true,
      indexes: [
        {
          fields: [config.tenant.field],
        },
        {
          unique: true,
          fields: [config.tenant.field, 'name'],
        },
      ],
    }
  );

  return Role;
}
