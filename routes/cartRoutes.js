// routes/cartRoutes.js
import express from "express";
import * as cartController from "../controllers/cartController.js";

const router = express.Router();

router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/remove', cartController.removeFromCart);
router.get('/', cartController.getCart);

export default router;
