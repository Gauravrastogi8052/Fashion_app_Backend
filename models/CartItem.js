import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const CartItem = sequelize.define("CartItem", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cartId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  price: { type: DataTypes.FLOAT, allowNull: false },
}, { timestamps: false });
