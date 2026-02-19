import express from "express";
import * as orderController from "../controllers/orderController.js";

const router = express.Router();

router.post("/create", orderController.createOrder);
router.put("/update-status", orderController.updateOrderStatus);
router.get("/", orderController.getOrders);

export default router;
