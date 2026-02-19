import express from "express";
import * as paymentController from "../controllers/paymentController.js";

const router = express.Router();

router.post("/initiate", paymentController.initiatePayment);
router.post("/verify", paymentController.verifyPayment);
router.get("/", paymentController.getPaymentStatus);

export default router;
