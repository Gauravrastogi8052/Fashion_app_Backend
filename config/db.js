// // config/db.js
// import mysql from "mysql2";

// export const connectDB = () => {
//   const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//   });

//   db.connect((err) => {
//     if (err) {
//       console.error("DB connection error:", err);
//       process.exit(1); // stop server if DB fails
//     } else {
//       console.log("✅ DB connected successfully");
//       global.db = db; // make db globally accessible
//     }
//   });
// };
// config/db.js (Sequelize version)
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql"
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Sequelize MySQL connected");
  } catch (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  }
};
export default sequelize;