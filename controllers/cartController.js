// import { Cart } from "../models/Cart.js";
// import { CartItem } from "../models/CartItem.js";

// // Add item to cart
// export const addToCart = async (req, res) => {
//   try {
//     const { userId, productId, quantity, price } = req.body;

//     // check if cart exists
//     let cart = await Cart.findOne({ where: { userId } });
//     if (!cart) {
//       cart = await Cart.create({ userId });
//     }

//     // check if item exists in cart
//     let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
//     if (cartItem) {
//       cartItem.quantity += quantity;
//       await cartItem.save();
//     } else {
//       await CartItem.create({ cartId: cart.id, productId, quantity, price });
//     }

//     res.status(200).json({ message: "Item added to cart" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Update cart item quantity
// export const updateCartItem = async (req, res) => {
//   try {
//     const { userId, productId, quantity } = req.body;
//     const cart = await Cart.findOne({ where: { userId } });
//     if (!cart) return res.status(404).json({ message: "Cart not found" });

//     const cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
//     if (!cartItem) return res.status(404).json({ message: "Item not found in cart" });

//     cartItem.quantity = quantity;
//     await cartItem.save();

//     res.status(200).json({ message: "Cart item updated" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Remove item from cart
// export const removeFromCart = async (req, res) => {
//   try {
//     const { userId, productId } = req.body;
//     const cart = await Cart.findOne({ where: { userId } });
//     if (!cart) return res.status(404).json({ message: "Cart not found" });

//     await CartItem.destroy({ where: { cartId: cart.id, productId } });

//     res.status(200).json({ message: "Item removed from cart" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get user cart
// export const getCart = async (req, res) => {
//   try {
//     const userId = req.query.userId;

//     const cart = await Cart.findOne({
//       where: { userId },
//       include: [{ model: CartItem }] // ✅ object form required
//     });

//     if (!cart) return res.status(404).json({ message: "Cart not found" });

//     // return included items
//     res.status(200).json(cart.CartItems || []); // ✅ safe access
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// controllers/cartController.js

import { Cart } from "../models/Cart.js";
import { CartItem } from "../models/CartItem.js";
//import { Product } from "../models/Product.js";
import { Product } from "../models/Products.js"; // ✅ sahi


// ---------------- ADD ITEM TO CART ----------------
export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body; // price removed
    // return res.status(400).json(req.body);
    if (!userId || !productId || quantity==null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    const product = await Product.findByPk(productId); // ✅ fetch product
    if (!product) return res.status(404).json({ message: "Product not found" });

    const price = product.price;

    let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      await CartItem.create({ cartId: cart.id, productId, quantity, price });
    }

    res.status(200).json({ message: "Item added to cart ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ---------------- UPDATE CART ITEM ----------------
export const updateCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
   if (!userId || !productId || quantity == null){
      return res.status(400).json({ message: "All fields are required" });
    }

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (!cartItem) return res.status(404).json({ message: "Item not found in cart" });

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ message: "Cart item updated ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- REMOVE ITEM FROM CART ----------------
export const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ message: "User ID and Product ID required" });
    }

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await CartItem.destroy({ where: { cartId: cart.id, productId } });

    res.status(200).json({ message: "Item removed from cart ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- GET USER CART ----------------
export const getCart = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: "CartItems",
          include: [
            { model: Product, attributes: ["id", "name", "price", "imageUrl", "category"] }
          ]
        }
      ]
    });

   if (!cart) return res.status(404).json({ message: "Cart not found" });


    res.status(200).json(cart.CartItems || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
