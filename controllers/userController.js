import User from "../models/User.js";
import { Order } from "../models/Order.js";

// Get all users with order count and revenue
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'address', 'city', 'state', 'pinCode', 'createdAt', 'updatedAt'],
      order: [['id', 'DESC']]
    });

    // Fetch all orders to calculate per-user stats
    const orders = await Order.findAll({
      attributes: ['id', 'userId', 'totalAmount', 'status', 'createdAt']
    });

    // Enrich user data with order statistics
    const enrichedUsers = users.map(user => {
      const userOrders = orders.filter(order => order.userId === user.id);
      const totalRevenue = userOrders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
      const orderCount = userOrders.length;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '-',
        address: user.address || '-',
        city: user.city || '-',
        state: user.state || '-',
        pinCode: user.pinCode || '-',
        status: 'active',
        joinDate: user.createdAt,
        orderCount: orderCount,
        totalRevenue: totalRevenue,
        lastOrder: userOrders.length > 0 ? userOrders[userOrders.length - 1].createdAt : null
      };
    });

    res.json(enrichedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get user by ID with orders
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
      include: {
        model: Order,
        attributes: ['id', 'totalAmount', 'status', 'createdAt']
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, city, state, pinCode } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update only provided fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (city) user.city = city;
    if (state) user.state = state;
    if (pinCode) user.pinCode = pinCode;

    await user.save();
    res.json({ message: "User profile updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};
