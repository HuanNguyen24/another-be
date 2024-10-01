import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Food extends Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('Food', {
    foodId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Category',
        key: 'categoryId'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    price: {
      type: DataTypes.REAL,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    createdTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('now')
    },
    imgURL: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'Food',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Food_pkey",
        unique: true,
        fields: [
          { name: "foodId" },
        ]
      },
    ]
  });
  }
}
