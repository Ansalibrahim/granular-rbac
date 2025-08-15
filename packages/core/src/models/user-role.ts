import { Model, DataTypes, Sequelize } from 'sequelize';

export function createUserRoleModel(sequelize: Sequelize) {
  class UserRole extends Model {
    public userId!: number;
    public roleId!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  UserRole.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'role_id',
        references: {
          model: 'roles', // Use existing table name
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'UserRole',
      tableName: 'user_roles', // Use existing table name
      underscored: true,
      indexes: [
        {
          fields: ['user_id'],
        },
        {
          fields: ['role_id'],
        },
      ],
    }
  );

  return UserRole;
}
