import { Sequelize } from 'sequelize';
import { RBACConfig } from '../types';
import { createRoleModel } from './role';
import { createUserRoleModel } from './user-role';

export function createModels(
  sequelize: Sequelize,
  config: RBACConfig
): {
  Role: ReturnType<typeof createRoleModel>,
  UserRole: ReturnType<typeof createUserRoleModel>
} {
  const Role = createRoleModel(sequelize, config);
  const UserRole = createUserRoleModel(sequelize);

  // Set up associations
  Role.belongsToMany(sequelize.models.User || sequelize.define('User', {}), {
    through: UserRole,
    foreignKey: 'roleId',
    as: 'users',
  });

  return {
    Role,
    UserRole,
  };
}

export { createRoleModel } from './role';
export { createUserRoleModel } from './user-role';
