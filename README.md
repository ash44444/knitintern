# 📝 Trustify

> A modern full-stack authentication and product management system with role-based access control, secure API endpoints, and clean architecture.

## 📋 Table of Contents

- **[🌟 Features](#-features)**
- **[🏗️ Architecture](#️-architecture)**
- **[📁 Project Structure](#-project-structure)**
- **[🚀 Quick Start](#-quick-start)**
- **[📚 API Documentation](#-api-documentation)**
- **[🚀 Deployment](#-deployment)**
- **[🔒 Security Features](#-security-features)**
- **[🧪 Testing](#-testing)**
- **[🐛 Troubleshooting](#-troubleshooting)**
- **[🤝 Contributing](#-contributing)**
- **[👤 Author](#-author)**
- **[📄 License](#-license)**

## 🌟 Features

### 🔐 Authentication & Security

- **JWT auth** with secure token storage
- **Protected API routes** via middleware
- **Password hashing** with bcrypt
- **Input validation** and CORS protection
- **Role-based access control** (user/admin)

### 👥 User Management

- **User roles**: Admin and Regular users
- **Admin dashboard** for user management
- **Role updates** by admin users
- **Profile management**
- **Secure registration** and login

### 📦 Product Management

- **Product CRUD** operations (admin only)
- **Product listing** for all users
- **Rich product details**
- **Real-time updates**
- **Input validation**

### 🎨 UI/UX

- **Responsive** Tailwind CSS design
- **Modern components** and clean layout
- **Friendly loading and error states**
- **Role-based UI adaptation**

## 🏗️ Architecture

- **Frontend**: React (Vite), TailwindCSS, React Router, Axios
- **Backend**: Express, Mongoose, JWT
- **Security**: Helmet, CORS, Rate limiting
- **Clean layers**: controllers → middlewares → models → routes

## 📁 Project Structure

```
SecureGate/
├── backend/                      # Express API
│   ├── src/
│   │   ├── controllers/         # Route handlers
│   │   ├── middlewares/         # Auth middleware
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express routers
│   │   ├── validations/        # Zod schemas
│   │   ├── utils/              # Helper functions
│   │   └── app.js             # App entry
│   └── package.json
│
└── frontend/                    # React app
    ├── src/
    │   ├── components/         # UI components
    │   ├── pages/             # Page components
    │   ├── api/               # API client
    │   ├── store/             # Auth context
    │   └── styles/            # Tailwind CSS
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1) Clone and Backend Setup

```bash
npm install
cp .env.example .env  # create and edit
npm run dev
```

Backend .env example:

```env
MONGODB_URI=mongodb://localhost:27017/SecureGate
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
PORT=8080
```

### 2) Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

### 3) Seed Initial Data

```bash
cd ../backend
node src/scripts/seed.js
```

This creates:

- Admin user: admin@example.com / admin123
- Regular user: user@example.com / user123
- Sample products

### URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1
- API Docs: http://localhost:5000/api-docs

## 📚 API Documentation

### Auth

| Method | Endpoint              | Body                        |
| ------ | --------------------- | --------------------------- |
| POST   | `/api/v1/auth/signup` | `{ name, email, password }` |
| POST   | `/api/v1/auth/login`  | `{ email, password }`       |
| POST   | `/api/v1/auth/logout` | -                           |
| GET    | `/api/v1/auth/me`     | -                           |

### Users (Admin)

| Method | Endpoint                       | Notes            |
| ------ | ------------------------------ | ---------------- |
| GET    | `/api/v1/admin/users`          | List all users   |
| PATCH  | `/api/v1/admin/users/:id/role` | Update user role |

### Products

| Method | Endpoint               | Notes                  |
| ------ | ---------------------- | ---------------------- |
| GET    | `/api/v1/products`     | List all products      |
| POST   | `/api/v1/products`     | Create product (admin) |
| GET    | `/api/v1/products/:id` | Get single product     |
| PATCH  | `/api/v1/products/:id` | Update product (admin) |
| DELETE | `/api/v1/products/:id` | Delete product (admin) |

All non-auth routes require `Authorization: Bearer <token>` header.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication system
  - All protected endpoints require `Authorization: Bearer <token>` header
  - Token validation occurs in middleware before request processing
  - Automatic token handling in frontend API client
- **Password Hashing**: Passwords are securely hashed using bcrypt
- **Input Validation**: All user inputs are validated using Zod
- **CORS Protection**: Configured CORS to prevent unauthorized access
- **Rate Limiting**: API rate limiting to prevent brute force attacks
- **HTTP Security Headers**: Helmet.js for setting secure HTTP headers
- **Error Handling**: Centralized error handling with proper status codes
- **Secure Cookies**: HTTP-only cookies for sensitive data
- **Role-Based Access**: Different access levels for users and admins
- **Token Expiration Handling**: Frontend automatically handles 401 responses
-
-
-
- Redis Caching in Product APIs

This project uses Redis to improve performance and reduce database load by caching product data for frequent requests. Here's how caching works in this API:

1. List Products (GET /products)

The API first checks if the product list is stored in Redis (products:list key).

Cache hit: Returns cached data immediately with a cached: true flag.

Cache miss: Fetches products from MongoDB, stores the result in Redis for 60 seconds, then returns the response.

Purpose: Reduces repeated database queries for the product list.

2. Get Single Product (GET /products/:id)

Checks Redis for the product using the key product:<id>.

Cache hit: Returns cached product data.

Cache miss: Fetches product from MongoDB, caches it for 5 minutes, then returns the response.

Purpose: Improves response time for frequently accessed products.

3. Create, Update, and Delete Product

After creating, updating, or deleting a product, the API invalidates relevant cache keys:

products:list (the cached product list)

product:<id> (for single product updates or deletions)

Purpose: Ensures cache stays consistent with the database.

4. Benefits

Faster response times for product listings and details.

Reduced load on MongoDB by serving repeated requests from Redis.

Improved scalability for high-traffic scenarios.
## 🐛 Troubleshooting

- If frontend cannot reach backend, verify API URL in .env
- Ensure MongoDB is running and accessible
- Check JWT token in localStorage
- Verify correct user role for protected actions
