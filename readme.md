
````markdown
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

4. **Start the server**

```bash
npm run dev
```

Server will run at: `http://localhost:5000`

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
  "message": "User Registered Successfully"
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

For any protected route (like adding products, adding to cart, placing order):

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

```

---
