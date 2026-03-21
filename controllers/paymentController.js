
import Razorpay from "razorpay";
import { Payment } from "../models/Payment.js";


import { Order } from "../models/Order.js"; // ✅ named import


import crypto from "crypto";
import sequelize from "../config/db.js"; // transaction ke liye

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ------------------ Initiate Payment ------------------
export const initiatePayment = async (req, res) => {
  try {
    const { orderId, amount, currency = "INR" } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt: `receipt_order_${orderId}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save payment record
    await Payment.create({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency,
      status: "created"
    });

    res.status(200).json({ razorpayOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ Verify Payment ------------------
export const verifyPayment = async (req, res) => {
  const t = await sequelize.transaction(); // start transaction
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      await t.rollback();
      return res.status(400).json({ message: "All fields are required" });
    }

    const paymentRecord = await Payment.findOne({
      where: { razorpayOrderId: razorpay_order_id },
      transaction: t
    });

    if (!paymentRecord) {
      await t.rollback();
      return res.status(404).json({ message: "Payment record not found" });
    }

    // already paid check
    if (paymentRecord.status === "paid") {
      await t.rollback();
      return res.status(400).json({ message: "Payment already verified" });
    }

    // generate signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid signature ❌" });
    }

    // update payment
    paymentRecord.status = "paid";
    paymentRecord.paymentId = razorpay_payment_id;
    await paymentRecord.save({ transaction: t });

    // update order
    const order = await Order.findByPk(paymentRecord.orderId, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "paid";
    await order.save({ transaction: t });

    await t.commit();
    res.status(200).json({ message: "Payment verified successfully ✅" });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};


// ------------------ Get Payment Status ------------------
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.query;
    const payment = await Payment.findOne({ where: { orderId } });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.status(200).json({ status: payment.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
