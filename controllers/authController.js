

// controllers/authController.js - REWRITTEN WITH SEQUELIZE
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import  User  from "../models/User.js"; // <-- CORRECT: Import the Sequelize Model
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://192.168.29.194:5000";

// ---------- SIGNUP ----------
export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists using Sequelize
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user with Sequelize. Password will be hashed by the 'beforeCreate' hook.
    const newUser = await User.create({ name, email, password });

    res.status(201).json({
      message: "Signup successful ✅",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Error creating user", details: err.message });
  }
};

// ---------- LOGIN ----------
// export const login = async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required" });
//   }

//   try {
//     // Find user by email using Sequelize
//     const user = await User.findOne({ where: { email } });

//     // Use the 'comparePassword' method we defined in the User model
//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

//     res.status(200).json({
//       message: "Login successful ✅",
//       token: token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ error: "DB error", details: err.message });
//   }
// };

// export const login = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required" });
//   }

//   try {
//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // ✅ bcrypt se password compare karo
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

//     res.status(200).json({
//       message: "Login successful ✅",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ error: "DB error", details: err.message });
//   }
// };



// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({
      message: "Login successful ✅",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "DB error", details: err.message });
  }
};

// ---------- FORGOT PASSWORD ----------
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists, for security
      return res.status(200).json({ message: "If a user with that email exists, a reset link has been sent." });
    }

    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "15m" });
    const expiryDate = new Date(Date.now() + 15 * 60 * 1000);

    // Save token using Sequelize
    user.reset_token = resetToken;
    user.reset_expiry = expiryDate;
    await user.save();

    const resetURL = `${FRONTEND_URL}/reset-password.html?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Click here to reset your password (valid 15 minutes): <a href="${resetURL}">${resetURL}</a></p>`,
    });

    res.status(200).json({ message: "Password reset email sent ✅" });

  } catch (err) {
    console.error("Forgot Password error:", err);
    res.status(500).json({ message: "Failed to send reset email" });
  }
};


// ---------- RESET PASSWORD ----------
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findOne({ 
            where: { 
                id: decoded.id, 
                reset_token: token,
                // Sequelize handles date comparison correctly
                // reset_expiry: { [Op.gt]: new Date() } // Use Op.gt for greater than
            } 
        });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // The password will be hashed automatically by the 'beforeUpdate' hook if you add it,
        // or you can hash it manually here. Let's assume you have a 'beforeUpdate' hook.
        user.password = newPassword; // The hook will hash this
        user.reset_token = null;
        user.reset_expiry = null;
        await user.save();

        res.status(200).json({ message: "Password reset successful ✅" });

    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
             return res.status(400).json({ message: "Invalid or expired token" });
        }
        res.status(500).json({ error: "DB error updating password", details: err.message });
    }
};