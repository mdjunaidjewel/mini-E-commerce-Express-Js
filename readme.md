````markdown
# Mini E-Commerce API

A **backend API** simulating a mini e-commerce platform with user authentication, role-based access, product management, cart operations, and order processing. Built with **Node.js, Express, and MongoDB**.

---

## 🚀 Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control:
  - Admin
  - Customer
- Fraud prevention: customers blocked after 3 order cancellations

### Product Management (Admin Only)
- Add, update, delete products
- Manage stock

### Customer Features
- Add/remove products to/from cart
- Place orders from cart
- Transaction-safe order processing
- Stock validation to prevent negative inventory

### Orders
- Place orders
- Cancel orders (with fraud prevention)
- Automatic stock update on orders and cancellations
- Order status: `pending`, `shipped`, `delivered`, `cancelled`

---

## 🧰 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT
- **Password Hashing:** bcryptjs
- **CORS Support:** cors
- **Environment Variables:** dotenv

---

## ⚙️ Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/mdjunaidjewel/mini-ecommerce-api.git
cd mini-ecommerce-api
````

2. **Install dependencies**

```bash
npm install
```

3. **Create `.env` file** in the project root:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=supersecretkey
```

4. **Start the server locally**

```bash
npm run dev
```

Server will run at: `http://localhost:5000`

> ✅ **Vercel live URL:** [https://mini-ecommerce-api-alpha.vercel.app](https://mini-ecommerce-api-alpha.vercel.app)

---

## 📌 Example Usage: Register & Login

### 1️⃣ Register User

**Endpoint:** `POST /api/register`
**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

**Response:**

```json
{
  "message": "User registered"
}
```

---

### 2️⃣ Login User

**Endpoint:** `POST /api/login`
**Body:**

```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> ✅ Save this token for authenticated requests in `Authorization: Bearer <token>` header.

---

### 3️⃣ Access Protected Routes

**Headers:**

```
Authorization: Bearer <your-token>
Content-Type: application/json
```

---

### 4️⃣ Add Product (Admin Only)

**Endpoint:** `POST /api/products`
**Body:**

```json
{
  "name": "iPhone 15",
  "price": 1200,
  "stock": 50,
  "description": "Latest Apple iPhone"
}
```

**Response:**

```json
{
  "_id": "64ff1a2c5c3b8f1234567890",
  "name": "iPhone 15",
  "price": 1200,
  "stock": 50,
  "description": "Latest Apple iPhone",
  "createdAt": "2026-02-11T12:34:56.789Z",
  "updatedAt": "2026-02-11T12:34:56.789Z",
  "__v": 0
}
```

---

### 5️⃣ Add Product to Cart

**Endpoint:** `POST /api/cart`
**Body:**

```json
{
  "productId": "64ff1a2c5c3b8f1234567890",
  "quantity": 2
}
```

**Response:**

```json
{
  "_id": "64ff1b3d5c3b8f1234567891",
  "user": "64ff18c25c3b8f123456788f",
  "items": [
    {
      "product": "64ff1a2c5c3b8f1234567890",
      "quantity": 2
    }
  ],
  "createdAt": "2026-02-11T12:45:00.000Z",
  "updatedAt": "2026-02-11T12:45:00.000Z",
  "__v": 0
}
```

---

### 6️⃣ Place Order from Cart

**Endpoint:** `POST /api/orders/from-cart`

**Response:**

```json
[
  {
    "_id": "64ff1c4d5c3b8f1234567892",
    "user": "64ff18c25c3b8f123456788f",
    "items": [
      {
        "product": "64ff1a2c5c3b8f1234567890",
        "quantity": 2,
        "price": 1200
      }
    ],
    "totalAmount": 2400,
    "status": "pending",
    "createdAt": "2026-02-11T12:50:00.000Z",
    "updatedAt": "2026-02-11T12:50:00.000Z",
    "__v": 0
  }
]
```

---

### 7️⃣ Cancel Order

**Endpoint:** `POST /api/orders/:id/cancel`

**Response:**

```json
{
  "message": "Order cancelled"
}
```

> ⚠️ Customers are blocked automatically after 3 cancellations.

---

## 🛠️ Postman Setup

### 1️⃣ Environment

Use this environment in Postman:
[Postman Environment Link](https://mdjunaidjewell-2139297.postman.co/workspace/Md-Junaid-Jewel's-Workspace~2190d898-49aa-4d8c-8e78-203be9ce7b5d/environment/51625251-af535000-1a39-4572-9ce2-fef12720da79?action=share&creator=51625251&active-environment=51625251-af535000-1a39-4572-9ce2-fef12720da79)

* `baseUrl` → Local: `http://localhost:5000/api` or Vercel live URL
* `token` → Paste your JWT token after login

---

### 2️⃣ Collection

Import all API routes in Postman:
[Postman Collection Link](https://mdjunaidjewell-2139297.postman.co/workspace/Md-Junaid-Jewel's-Workspace~2190d898-49aa-4d8c-8e78-203be9ce7b5d/collection/51625251-c884f6bf-3f30-480b-b2bb-948197e2addf?action=share&creator=51625251&active-environment=51625251-af535000-1a39-4572-9ce2-fef12720da79)

> 🔑 Default Admin Login for testing protected routes:

```json
{
  "email": "mdjunaid@gmail.com",
  "password": "123456"
}
```

Copy the returned token and paste into Postman `token` variable to access Admin-only routes.

---

## 🌐 Live Demo & Quick Start

Try the API directly without any local setup:

* **Vercel Live URL:** [https://mini-ecommerce-api-alpha.vercel.app](https://mini-ecommerce-api-alpha.vercel.app)
* Use Postman + environment variable to test all endpoints.
* Admin login included above to test product management and other protected routes.

> ✅ Just import the collection, set `baseUrl` to live URL, and you are ready to go!

```

`
