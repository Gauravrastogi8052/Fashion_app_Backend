import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";


// export const Order = sequelize.define("Order", {
//   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   userId: { type: DataTypes.INTEGER, allowNull: false },
//   totalAmount: { type: DataTypes.FLOAT, allowNull: false },
//   status: { type: DataTypes.STRING, defaultValue: "pending" },
//   createdAt: { type: DataTypes.DATE, allowNull: true },
// }, { timestamps: true });
export const Order = sequelize.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  totalAmount: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "pending" },
}, { timestamps: true });
