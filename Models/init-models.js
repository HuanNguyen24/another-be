import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Category from  "./Category.js";
import _Food from  "./Food.js";
import _Order from  "./Order.js";
import _OrderFood from  "./OrderFood.js";
import _Role from  "./Role.js";
import _Status from  "./Status.js";
import _Table from  "./Table.js";
import _User from  "./User.js";

export default function initModels(sequelize) {
  const Category = _Category.init(sequelize, DataTypes);
  const Food = _Food.init(sequelize, DataTypes);
  const Order = _Order.init(sequelize, DataTypes);
  const OrderFood = _OrderFood.init(sequelize, DataTypes);
  const Role = _Role.init(sequelize, DataTypes);
  const Status = _Status.init(sequelize, DataTypes);
  const Table = _Table.init(sequelize, DataTypes);
  const User = _User.init(sequelize, DataTypes);

  Food.belongsToMany(Order, { as: 'orderId_Orders', through: OrderFood, foreignKey: "foodId", otherKey: "orderId" });
  Order.belongsToMany(Food, { as: 'foodId_Foods', through: OrderFood, foreignKey: "orderId", otherKey: "foodId" });
  Food.belongsTo(Category, { as: "category", foreignKey: "categoryId"});
  Category.hasMany(Food, { as: "Foods", foreignKey: "categoryId"});
  OrderFood.belongsTo(Food, { as: "food", foreignKey: "foodId"});
  Food.hasMany(OrderFood, { as: "OrderFoods", foreignKey: "foodId"});
  OrderFood.belongsTo(Order, { as: "order", foreignKey: "orderId"});
  Order.hasMany(OrderFood, { as: "OrderFoods", foreignKey: "orderId"});
  User.belongsTo(Role, { as: "roleCode_Role", foreignKey: "roleCode"});
  Role.hasMany(User, { as: "Users", foreignKey: "roleCode"});
  Order.belongsTo(Status, { as: "statusCode_Status", foreignKey: "statusCode"});
  Status.hasMany(Order, { as: "Orders", foreignKey: "statusCode"});
  Order.belongsTo(Table, { as: "table", foreignKey: "tableId"});
  Table.hasMany(Order, { as: "Orders", foreignKey: "tableId"});
  Order.belongsTo(User, { as: "finishedBy_User", foreignKey: "finishedBy"});
  User.hasMany(Order, { as: "Orders", foreignKey: "finishedBy"});
  Order.belongsTo(User, { as: "orderedBy_User", foreignKey: "orderedBy"});
  User.hasMany(Order, { as: "orderedBy_Orders", foreignKey: "orderedBy"});

  return {
    Category,
    Food,
    Order,
    OrderFood,
    Role,
    Status,
    Table,
    User,
  };
}
