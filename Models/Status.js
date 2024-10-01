import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Status extends Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('Status', {
    statusCode: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      primaryKey: true
    },
    desc: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'Status',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Status_pkey",
        unique: true,
        fields: [
          { name: "statusCode" },
        ]
      },
    ]
  });
  }
}
