
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";


import { Cart } from "../models/Cart.js";
import { CartItem } from "../models/CartItem.js";
import { Product } from "../models/Products.js";

// ---------------- CREATE ORDER FROM CART ----------------
export const createOrder = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    // Get user's cart with items
    const cart = await Cart.findOne({
      where: { userId },
      include: [{ model: CartItem, as: "CartItems" }]
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    // Calculate total amount
    const totalAmount = cart.CartItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    // Create order
    const order = await Order.create({
      userId,
      totalAmount,
      status: "pending",
    });

    // Copy cart items to order items
    const orderItems = cart.CartItems.map(item => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    }));
    await OrderItem.bulkCreate(orderItems);

    // Clear user's cart
    await CartItem.destroy({ where: { cartId: cart.id } });

    res.status(200).json({ message: "Order created successfully ✅", orderId: order.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- UPDATE ORDER STATUS ----------------
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) return res.status(400).json({ message: "Order ID and status required" });

    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- GET ALL ORDERS (ADMIN) ----------------
export const getAllOrders = async (req, res) => {
  try {
    console.log("Fetching all orders for admin...");
    
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: "OrderItems",
          include: [
            { model: Product, attributes: ["id", "name", "price", "imageUrl", "category"] }
          ]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    console.log(`Found ${orders.length} orders`);
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: err.message });
  }
};

// ---------------- GET USER ORDERS ----------------
export const getOrders = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: "User ID required" });

    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: "OrderItems",
          include: [
            { model: Product, attributes: ["id", "name", "price", "imageUrl", "category"] }
          ]
        }
      ]
    });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
