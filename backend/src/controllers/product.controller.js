import { Product } from "../models/product.model.js"
import { logUserAction, logAdminAction, logError } from "../utils/logger.js"
import { redisClient } from "../app.js" // 🧩 Redis

export async function listProducts(req, res) {
  try {
    // 🧩 Check cache first
    const cached = await redisClient.get("products:list");
    if (cached) {
      const products = JSON.parse(cached);
      logUserAction(req.user._id, 'List Products (Cache Hit)', {
        count: products.length
      });
      return res.json({
        success: true,
        count: products.length,
        data: { products },
        cached: true // just to show source
      });
    }

    // Fetch all products and properly populate the createdBy field
    const products = await Product.find().populate("createdBy", "email")

    // 🧩 Cache the products for 60 seconds
    await redisClient.set("products:list", JSON.stringify(products), { EX: 60 });

    logUserAction(req.user._id, 'List Products', {
      count: products.length
    })

    res.json({
      success: true,
      count: products.length,
      data: { products },
    })
  } catch (error) {
    logError(error, { context: 'listProducts', userId: req.user._id })
    res.status(500).json({
      success: false,
      message: "Error fetching products",
    })
  }
}

export async function getProduct(req, res) {
  try {
    const cacheKey = `product:${req.params.id}`; // 🧩 Redis key

    // 🧩 Try cached product
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const product = JSON.parse(cached);
      logUserAction(req.user._id, 'Get Product (Cache Hit)', {
        productId: req.params.id
      });
      return res.json({
        success: true,
        data: { product },
        cached: true
      });
    }

    const product = await Product.findById(req.params.id).populate(
      "createdBy",
      "email"
    )

    if (!product) {
      logUserAction(req.user._id, 'Get Product Failed - Not Found', {
        productId: req.params.id
      }, 'failure')
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // 🧩 Cache product for 5 minutes
    await redisClient.set(cacheKey, JSON.stringify(product), { EX: 300 });

    logUserAction(req.user._id, 'Get Product Success', {
      productId: product._id
    })

    res.json({
      success: true,
      data: { product },
    })
  } catch (error) {
    logError(error, {
      context: 'getProduct',
      userId: req.user._id,
      productId: req.params.id
    })
    res.status(500).json({
      success: false,
      message: "Error fetching product",
    })
  }
}

export async function createProduct(req, res) {
  try {
    console.log("Product creation request body:", req.body);
    console.log("User in request:", req.user);

    if (!req.body.name || req.body.name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Product name is required"
      });
    }

    const price = Number(req.body.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number"
      });
    }

    const productData = {
      name: req.body.name.trim(),
      description: req.body.description || "",
      price: price,
      createdBy: req.user.id
    }

    const product = await Product.create(productData)

    logAdminAction(req.user._id, 'Create Product Success', {
      productId: product._id,
      name: product.name
    })

    // 🧩 Invalidate cached product list
    await redisClient.del("products:list");

    res.status(201).json({
      success: true,
      data: { product },
    })
  } catch (error) {
    logError(error, {
      context: 'createProduct',
      userId: req.user._id,
      productData: req.body
    })
    res.status(500).json({
      success: false,
      message: "Error creating product",
    })
  }
}

export async function updateProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      logAdminAction(req.user._id, 'Update Product Failed - Not Found', {
        productId: req.params.id
      }, 'failure')
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    Object.assign(product, req.body)
    await product.save()

    logAdminAction(req.user._id, 'Update Product Success', {
      productId: product._id,
      name: product.name,
      changes: req.body
    })

    // 🧩 Invalidate caches
    await redisClient.del("products:list");
    await redisClient.del(`product:${req.params.id}`);

    res.json({
      success: true,
      data: { product },
    })
  } catch (error) {
    logError(error, {
      context: 'updateProduct',
      userId: req.user._id,
      productId: req.params.id,
      updates: req.body
    })
    res.status(500).json({
      success: false,
      message: "Error updating product",
    })
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      logAdminAction(req.user._id, 'Delete Product Failed - Not Found', {
        productId: req.params.id
      }, 'failure')
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    await product.deleteOne()

    logAdminAction(req.user._id, 'Delete Product Success', {
      productId: req.params.id,
      name: product.name
    })

    // 🧩 Invalidate caches
    await redisClient.del("products:list");
    await redisClient.del(`product:${req.params.id}`);

    res.json({
      success: true,
      data: null,
    })
  } catch (error) {
    logError(error, {
      context: 'deleteProduct',
      userId: req.user._id,
      productId: req.params.id
    })
    res.status(500).json({
      success: false,
      message: "Error deleting product",
    })
  }
}
