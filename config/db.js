
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