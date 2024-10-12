import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class User extends Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('User', {
    userId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "User_userName_key"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    pwd: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    roleCode: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Role',
        key: 'roleCode'
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    createdTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('now')
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ""
    },
    phoneNumber: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ""
    }
  }, {
    tableName: 'User',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "User_pkey",
        unique: true,
        fields: [
          { name: "userId" },
        ]
      },
      {
        name: "User_userName_key",
        unique: true,
        fields: [
          { name: "userName" },
        ]
      },
    ]
  });
  }
}