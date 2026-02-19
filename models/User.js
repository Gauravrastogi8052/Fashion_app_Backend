// import { DataTypes } from "sequelize";
// import sequelize from "../config/db.js";

// export const User = sequelize.define("User", {
//   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   name: { type: DataTypes.STRING, allowNull: false },
//   email: { type: DataTypes.STRING, allowNull: false, unique: true },
//   password: { type: DataTypes.STRING, allowNull: false },
//   reset_token: { type: DataTypes.STRING, allowNull: true },
//   reset_expiry: { type: DataTypes.DATE, allowNull: true },
// }, { timestamps: true });
// import { DataTypes } from "sequelize";
// import bcrypt from "bcrypt";
// import sequelize from "../config/db.js";

// const User = sequelize.define("User", {
//   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   name: { type: DataTypes.STRING, allowNull: false },
//   email: { type: DataTypes.STRING, allowNull: false, unique: true },
//   password: { type: DataTypes.STRING, allowNull: false },
//   reset_token: { type: DataTypes.STRING, allowNull: true },
//   reset_expiry: { type: DataTypes.DATE, allowNull: true },
// }, { timestamps: true });

// // ✅ hash password before save
// User.beforeCreate(async (user) => {
//   user.password = await bcrypt.hash(user.password, 10);
// });

// User.beforeUpdate(async (user) => {
//   if (user.changed("password")) {
//     user.password = await bcrypt.hash(user.password, 10);
//   }
// });

// export default User;
import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  reset_token: { type: DataTypes.STRING, allowNull: true },
  reset_expiry: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true });

// hash before create
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

// hash before update
User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

export default User;
