import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Category extends Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('Category', {
    categoryId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'Category',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Category_pkey",
        unique: true,
        fields: [
          { name: "categoryId" },
        ]
      },
    ]
  });
  }
}
