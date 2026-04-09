import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import sequelize from "./config/db.js";

// ===== Import models & associations =====
import "./models/index.js";  // <-- ye import sab models aur associations load karega

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cron from "node-cron";
import { backupDatabase } from "./utils/backupService.js";
dotenv.config();
connectDB();

// Sync sequelize models with database
sequelize.sync({ alter: false })
    .then(() => {
        console.log("✅ Database schema updated!");
    })
    .catch(err => {
        console.error("❌ Failed to update database schema:", err);
    });

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.send("Backend running successfully 🚀");
});

// Routes
app.use("/auth", authRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/payment", paymentRoutes);
app.use("/products", productRoutes);
app.use("/report", reportRoutes);  // ✅ Reports API
app.use("/users", userRoutes);  // ✅ Users API

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
console.log("✅ Cron initialized...");
cron.schedule("* * * * *", () => {
  console.log("⏰ Running backup...");
  backupDatabase();
});
