import User from "./User.js";
import { Cart } from "./Cart.js";
import { CartItem } from "./CartItem.js";
import { Product } from "./Products.js";
import { Order } from "./Order.js";
import { OrderItem } from "./OrderItem.js";
import { Payment } from "./Payment.js";

// ==================== Associations ==================== //

// User -> Cart (1:1)
User.hasOne(Cart, { foreignKey: "userId" });
Cart.belongsTo(User, { foreignKey: "userId" });

// Cart -> CartItem (1:N)
Cart.hasMany(CartItem, { foreignKey: "cartId", as: "CartItems" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

// Product -> CartItem (1:N)
Product.hasMany(CartItem, { foreignKey: "productId" });
CartItem.belongsTo(Product, { foreignKey: "productId" });

// User -> Order (1:N)
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

// Order -> OrderItem (1:N)
Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// Product -> OrderItem (1:N)
Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

// Order -> Payment (1:1)
Order.hasOne(Payment, { foreignKey: "orderId" });
Payment.belongsTo(Order, { foreignKey: "orderId" });

// ==================== Export Models ==================== //
export {
  User,
  Cart,
  CartItem,
  Product,
  Order,
  OrderItem,
  Payment,
};
