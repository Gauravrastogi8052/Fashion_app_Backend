
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  razorpayOrderId: { type: DataTypes.STRING, allowNull: false },
  paymentId: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.STRING, defaultValue: "created" },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: "INR" }
}, { timestamps: true });
