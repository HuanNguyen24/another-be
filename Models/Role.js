import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Role extends Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('Role', {
    roleCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'Role',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Role_pkey",
        unique: true,
        fields: [
          { name: "roleCode" },
        ]
      },
    ]
  });
  }
}
