import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Order extends Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('Order', {
    orderId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tableId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Table',
        key: 'tableId'
      }
    },
    orderTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('now')
    },
    finishTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    payTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    orderedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'userId'
      }
    },
    finishedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'User',
        key: 'userId'
      }
    },
    statusCode: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      references: {
        model: 'Status',
        key: 'statusCode'
      }
    }
  }, {
    tableName: 'Order',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Order_pkey",
        unique: true,
        fields: [
          { name: "orderId" },
        ]
      },
    ]
  });
  }
}
