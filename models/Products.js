// import { DataTypes } from "sequelize";
// import sequelize from "../config/db.js";

// export const Product = sequelize.define("Product", {
//   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   name: { type: DataTypes.STRING, allowNull: false },
//   price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
//   category: { type: DataTypes.STRING, allowNull: true },
//   image_url: { type: DataTypes.TEXT, allowNull: true },
//   createdAt: { type: DataTypes.DATE, allowNull: false },
//   updatedAt: { type: DataTypes.DATE, allowNull: false },
// }, { timestamps: true });
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  category: { type: DataTypes.STRING, allowNull: true },
  imageUrl: { type: DataTypes.TEXT, allowNull: true }, // ✅ camelCase match controller
}, { timestamps: true });
