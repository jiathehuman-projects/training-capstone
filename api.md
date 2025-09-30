# API Endpoints for Order Management
### Server Configuration
- **Development Server**: http://localhost:5000
- **Production Server**: https://api.restaurant.com (configurable)

#### 🔐 Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### 🍽️ Menu Endpoints  
- `GET /api/menu` - Get all menu items (public)

#### 📦 Order Management Endpoints
- `POST /api/` - Create new order (authenticated)
- `GET /api/{orderId}` - Get order details (authenticated)
- `PUT /api/{orderId}/confirm` - Confirm order (authenticated)
- `GET /api/{orderId}/status` - Get order status (authenticated)
- `PUT /api/{orderId}/status` - Update order status (staff only)
- `GET /api/customer/{customerId}` - Get customer orders (authenticated)

#### 🏥 System Endpoints
- `GET /health` - Health check
- `GET /test` - Test endpoint

## Authentication

For authenticated endpoints, include the following header:
```
Authorization: Bearer <JWT_TOKEN>
```

To get a JWT token, first register or login using the auth endpoints.

---

## 1. Get Menu Items (Public)

**Request Method:** GET  
**URL:** `http://localhost:5000/api/menu`  
**Headers:** None required  
**Request Body:** None  

**Query Parameters (Optional):**
- `category` - Filter by category (e.g., appetizers, mains, desserts, beverages)
- `available` - Set to "true" to show only available items
- `search` - Search by name or description

**Example with query params:**
```
GET http://localhost:5000/api/menu?category=mains&available=true&search=salmon
```

---

## 2. Create Order (Customer)

**Request Method:** POST  
**URL:** `http://localhost:5000/api/orders`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```
**Request Body:**
```json
{
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "customizations": "No onions, extra sauce"
    },
    {
      "menuItemId": 3,
      "quantity": 1
    }
  ],
  "tableNumber": 5
}
```

---

## 3. Get Order Details (Customer/Staff)

**Request Method:** GET  
**URL:** `http://localhost:5000/api/orders/{orderId}`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None  

**Example:**
```
GET http://localhost:5000/api/orders/123
```

---

## 4. Confirm Order (Customer)

**Request Method:** PUT  
**URL:** `http://localhost:5000/api/orders/{orderId}/confirm`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```
**Request Body:**
```json
{
  "confirmed": true
}
```

**Example:**
```
PUT http://localhost:5000/api/orders/123/confirm
```

---

## 5. Get Order Status (Customer/Staff)

**Request Method:** GET  
**URL:** `http://localhost:5000/api/orders/{orderId}/status`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None  

**Example:**
```
GET http://localhost:5000/api/orders/123/status
```

---

## 6. Get Customer Order History (Customer/Staff)

**Request Method:** GET  
**URL:** `http://localhost:5000/api/orders/customer/{customerId}`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None  

**Query Parameters (Optional):**
- `limit` - Number of orders to return (default: 10)
- `offset` - Number of orders to skip (default: 0)

**Example:**
```
GET http://localhost:5000/api/orders/customer/456?limit=5&offset=10
```

---

## 7. Update Order Status (Staff Only)

**Request Method:** PUT  
**URL:** `http://localhost:5000/api/orders/{orderId}/status`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```
**Request Body:**
```json
{
  "status": "in_kitchen"
}
```

**Valid status values:**
- `"in_kitchen"` - Order is being prepared
- `"ready"` - Order is ready for pickup/serving
- `"served"` - Order has been served to customer
- `"closed"` - Order is completed
- `"cancelled"` - Order has been cancelled

**Example:**
```
PUT http://localhost:5000/api/orders/123/status
```

---

## Authentication Endpoints (Required for JWT Token)

### Register User

**Request Method:** POST  
**URL:** `http://localhost:5000/api/auth/register`  
**Headers:** 
```
Content-Type: application/json
```
**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### Login User

**Request Method:** POST  
**URL:** `http://localhost:5000/api/auth/login`  
**Headers:** 
```
Content-Type: application/json
```
**Request Body:**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

---

## Testing Workflow

1. **Register a new user** using the register endpoint
2. **Login** to get a JWT token
3. **Browse the menu** using the menu endpoint
4. **Create an order** with menu items
5. **Confirm the order** to move it from DRAFT to PLACED
6. **Check order status** to see updates
7. **Update order status** (if you have staff role) to simulate kitchen workflow
8. **View order history** for the customer

## Environment Setup

Before testing, ensure you have a `.env` file in the backend directory with the following:

```
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=restaurant_db
PORT=5000
```

## Notes

- Replace `{orderId}` and `{customerId}` with actual numeric IDs
- Staff-only endpoints require users with roles: 'staff', 'manager', or 'admin'
- Customers can only access their own orders
- Orders expire after 30 minutes if left in DRAFT status
- Inventory is decremented when orders move to IN_KITCHEN status
- Make sure to set JWT_SECRET environment variable before starting the server