# API Endpoints for Order Management
### Server Configuration
- **Development Server**: http://localhost:5000
- **Production Server**: https://api.restaurant.com (configurable)

#### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Menu Endpoints (Public)
- `GET /api/menu` - Get all menu items (public)

#### Menu Management Endpoints (Manager/Admin Only)
- `POST /api/menu` - Create new menu item (manager/admin)
- `GET /api/menu` - Get all menu items for management (manager/admin)
- `GET /api/menu/{id}` - Get specific menu item (manager/admin)
- `PUT /api/menu/{id}` - Update menu item (manager/admin)
- `DELETE /api/menu/{id}` - Delete menu item (manager/admin)

#### Order Management Endpoints (Customer/ Staff)
- `POST /api/order` - Create new order (authenticated)
- `GET /api/{orderId}` - Get order details (authenticated)
- `PUT /api/{orderId}/confirm` - Confirm order (authenticated)
- `GET /api/{orderId}/status` - Get order status (authenticated)
- `PUT /api/{orderId}/status` - Update order status (staff only)
- `GET /api/customer/{customerId}` - Get customer orders (authenticated)

#### System Endpoints
- `GET /health` - Health check
- `GET /test` - Test endpoint

## Authentication

For authenticated endpoints, include the following header:
```
Authorization: Bearer <JWT_TOKEN>
```

To get a JWT token, first register or login using the auth endpoints.

---

## Menu Management Endpoints (Manager/Admin Only)

### 1. Create Menu Item

**Request Method:** POST  
**URL:** `http://localhost:5000/api/menu`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```
**Request Body (Form Data):**
- `name` (required) - Menu item name
- `category` (required) - Category (e.g., appetizers, mains, desserts, beverages)
- `price` (required) - Price as number
- `description` (required) - Item description
- `qtyOnHand` (required) - Quantity available as integer
- `preparationTimeMin` (optional) - Preparation time in minutes
- `costOfGoods` (optional) - Cost of goods as number
- `reorderThreshold` (optional) - Reorder threshold as integer
- `allergens` (optional) - JSON array string (e.g., '["nuts", "dairy"]')
- `image` (optional) - Image file (JPEG, JPG, PNG only)



### 2. Get All Menu Items (Management)

**Request Method:** GET  
**URL:** `http://localhost:5000/api/menu`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Query Parameters (Optional):**
- `category` - Filter by category
- `active` - Filter by active status (true/false)
- `search` - Search by name or description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)



### 3. Get Specific Menu Item

**Request Method:** GET  
**URL:** `http://localhost:5000/api/menu/{id}`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```



### 4. Update Menu Item

**Request Method:** PUT  
**URL:** `http://localhost:5000/api/menu/{id}`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```
**Request Body (Form Data - all optional):**
- `name` - Updated name
- `category` - Updated category
- `price` - Updated price
- `description` - Updated description
- `qtyOnHand` - Updated quantity
- `preparationTimeMin` - Updated prep time
- `costOfGoods` - Updated cost
- `reorderThreshold` - Updated threshold
- `allergens` - Updated allergens JSON array string
- `isActive` - Active status (true/false)
- `image` - New image file



### 5. Delete Menu Item (Soft Delete)

**Request Method:** DELETE  
**URL:** `http://localhost:5000/api/menu/{id}`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Public Menu Endpoint

### 1. Get Menu Items (Public)

**Request Method:** GET  
**URL:** `http://localhost:5000/api/menu`  
**Headers:** None required  
**Request Body:** None  

**Query Parameters (Optional):**
- `category` - Filter by category (e.g., appetizers, mains, desserts, beverages)
- `available` - Set to "true" to show only available items
- `search` - Search by name or description



---

## 2. Create Order (Customer)

**Request Method:** POST  
**URL:** `http://localhost:5000/api/order`  
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
**URL:** `http://localhost:5000/api/{orderId}`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None

---

## 4. Confirm Order (Customer)

**Request Method:** PUT  
**URL:** `http://localhost:5000/api/{orderId}/confirm`  
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

---

## 5. Get Order Status (Customer/Staff)

**Request Method:** GET  
**URL:** `http://localhost:5000/api/{orderId}/status`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None

---

## 6. Get Customer Order History (Customer/Staff)

**Request Method:** GET  
**URL:** `http://localhost:5000/api/customer/{customerId}`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None  

**Query Parameters (Optional):**
- `limit` - Number of orders to return (default: 10)
- `offset` - Number of orders to skip (default: 0)

---

## 7. Update Order Status (Staff Only)

**Request Method:** PUT  
**URL:** `http://localhost:5000/api/{orderId}/status`  
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

---

## Authentication Endpoints

### 8. Register User

**Request Method:** POST  
**URL:** `http://localhost:5000/auth/register`  
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

### 9. Login User

**Request Method:** POST  
**URL:** `http://localhost:5000/auth/login`  
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

## Notes

- Replace `{orderId}` and `{customerId}` with actual numeric IDs
- Staff-only endpoints require users with roles: 'staff', 'manager', or 'admin'
- Menu management endpoints require 'manager' or 'admin' roles only
- Customers can only access their own orders
- Orders expire after 30 minutes if left in DRAFT status
- Inventory is decremented when orders move to IN_KITCHEN status
- Make sure to set JWT_SECRET environment variable before starting the server
- Uploaded images are accessible at `http://localhost:5000/uploads/{filename}`
- Image uploads support JPEG, JPG, and PNG formats only
- Menu item deletion is soft delete (sets isActive to false)