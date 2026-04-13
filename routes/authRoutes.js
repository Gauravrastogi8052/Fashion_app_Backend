import express from "express";
import { signup, login, forgotPassword, resetPassword } from "../controllers/authController.js";
import { updateUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/update-profile/:id", updateUserProfile);

router.get("/reset-password.html", (req, res) => {
  res.send("Reset password page");
});


export default router;
