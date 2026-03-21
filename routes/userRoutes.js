import express from "express";
import { getAllUsers, getUserById, deleteUser } from "../controllers/userController.js";

const router = express.Router();

// Get all users
router.get("/", getAllUsers);

// Get user by ID
router.get("/:id", getUserById);

// Delete user
router.delete("/:id", deleteUser);

export default router;
