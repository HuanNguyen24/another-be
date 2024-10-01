import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class OrderFood extends Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('OrderFood', {
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Order',
        key: 'orderId'
      }
    },
    foodId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Food',
        key: 'foodId'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    price: {
      type: DataTypes.REAL,
      allowNull: true
    }
  }, {
    tableName: 'OrderFood',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "OrderFood_pkey",
        unique: true,
        fields: [
          { name: "orderId" },
          { name: "foodId" },
        ]
      },
    ]
  });
  }
}
