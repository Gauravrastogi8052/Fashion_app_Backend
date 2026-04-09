import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js"; // Cloudinary config file

import { Product } from "../models/Products.js";

const router = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Admin upload product
// router.post("/upload", upload.single("image"), async (req, res) => {
//   try {
//     const { name, price, category } = req.body;
//     if (!req.file) return res.status(400).json({ message: "Image is required" });

//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         folder: `closhop/${category}`,
//         upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
//       },
//       async (err, result) => {
//         if (err) return res.status(500).json({ message: err.message });

//         // Save product in DB
//         const product = await Product.create({
//           name,
//           price,
//           category,
//           imageUrl: result.secure_url 
//         });

//         res.status(200).json({ message: "Product uploaded", product });
//       }
//     );

//     streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });


router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category } = req.body;

    // 1️⃣ Image required
    if (!req.file) 
      return res.status(400).json({ message: "Image is required" });

    // 2️⃣ Name validation
    if (!name || typeof name !== "string" || !isNaN(name)) {
      return res.status(400).json({ message: "Product name must be a valid string (not number)" });
    }

    // 3️⃣ Price validation
    const parsedPrice = Number(price);
    if (!price || isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }

    // Cloudinary upload
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `closhop/${category}`,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
      },
      async (err, result) => {
        if (err) return res.status(500).json({ message: err.message });

        // Save product in DB
        const product = await Product.create({
          name,
          price: parsedPrice,
          category,
          imageUrl: result.secure_url 
        });

        res.status(200).json({ message: "Product uploaded", product });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all products...");
    const products = await Product.findAll();
    console.log(`Found ${products.length} products`);
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: err.message });
  }
});
// Delete product by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update product
// router.put("/:id", upload.single("image"), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, price, category } = req.body;

//     const product = await Product.findByPk(id);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     let imageUrl = product.imageUrl;

//     // Agar new image bheji ho to Cloudinary me upload karo
//     if (req.file) {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           folder: `closhop/${category || product.category}`,
//           upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
//         },
//         async (err, result) => {
//           if (err) return res.status(500).json({ message: err.message });

//           await product.update({
//             name: name || product.name,
//             price: price || product.price,
//             category: category || product.category,
//             imageUrl: result.secure_url
//           });

//           res.json({ message: "Product updated", product });
//         }
//       );

//       streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
//     } else {
//       // Sirf text fields update karo
//       await product.update({
//         name: name || product.name,
//         price: price || product.price,
//         category: category || product.category
//       });

//       res.json({ message: "Product updated", product });
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Validation
    if (name && (typeof name !== "string" || !isNaN(name))) {
      return res.status(400).json({ message: "Product name must be a valid string" });
    }

    const parsedPrice = price !== undefined ? Number(price) : undefined;
    if (price && (isNaN(parsedPrice) || parsedPrice < 0)) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }

    // Agar new image bheji ho to Cloudinary me upload karo
    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `closhop/${category || product.category}`,
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
        },
        async (err, result) => {
          if (err) return res.status(500).json({ message: err.message });

          await product.update({
            name: name || product.name,
            price: parsedPrice !== undefined ? parsedPrice : product.price,
            category: category || product.category,
            imageUrl: result.secure_url
          });

          res.json({ message: "Product updated", product });
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } else {
      // Sirf text fields update karo
      await product.update({
        name: name || product.name,
        price: parsedPrice !== undefined ? parsedPrice : product.price,
        category: category || product.category
      });

      res.json({ message: "Product updated", product });
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default router;
