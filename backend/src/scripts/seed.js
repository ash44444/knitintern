import mongoose from "mongoose"
import dotenv from "dotenv"
import { User } from "../models/user.model.js"
import { Product } from "../models/product.model.js"

dotenv.config()

const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin"
  },
  {
    name: "Regular User",
    email: "user@example.com",
    password: "user123",
    role: "user"
  }
]

const products = [
  {
    name: "Product 1",
    description: "This is product 1",
    price: 99.99
  },
  {
    name: "Product 2",
    description: "This is product 2",
    price: 149.99
  }
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ Connected to MongoDB")
    
    await Promise.all([User.deleteMany({}), Product.deleteMany({})])
    console.log("🗑️ Cleared existing data")
    
    const createdUsers = await User.create(users)
    console.log("👤 Created users:", createdUsers.map(u => ({ id: u._id, email: u.email, role: u.role })))
    
    const adminUser = createdUsers.find(u => u.role === "admin")
    const productsWithCreator = products.map(p => ({ ...p, createdBy: adminUser._id }))
    const createdProducts = await Product.create(productsWithCreator)
    console.log("📦 Created products:", createdProducts.map(p => ({ id: p._id, name: p.name })))
    
    await mongoose.disconnect()
    console.log("🔌 Disconnected from MongoDB")
    console.log("✅ Database seeding completed successfully. Exiting now...")
    
    process.exit(0)
  } catch (error) {
    console.error("❌ Error while seeding:", error.message)
    console.error(error.stack)
    console.log("⚠️ Exiting with failure code...")
    process.exit(1)
  }
}

seed()
