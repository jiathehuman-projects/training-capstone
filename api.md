# API Endpoints for Order Management
### Server Configuration
- **Development Server**: http://localhost:5000
- **Production Server**: https://api.restaurant.com (configurable)

#### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

#### Menu Endpoints (Public)
- `GET /api/menu` - Get all menu items (public)

#### Menu Management Endpoints (Manager/Admin Only)
- `POST /api/menu` - Create new menu item (manager/admin)
- `GET /api/menu` - Get all menu items for management (manager/admin)
- `GET /api/menu/{id}` - Get specific menu item (manager/admin)
- `PUT /api/menu/{id}` - Update menu item (manager/admin)
- `DELETE /api/menu/{id}` - Delete menu item (manager/admin)

#### Order Management Endpoints (Customer/ Staff)
- `GET /api/order/menu` - Get menu items (public)
- `POST /api/order` - Create new order (authenticated)
- `GET /api/order/{orderId}` - Get order details (authenticated)
- `PUT /api/order/{orderId}/confirm` - Confirm order (authenticated)
- `GET /api/order/{orderId}/status` - Get order status (authenticated)
- `PUT /api/order/{orderId}/status` - Update order status (staff only)
- `GET /api/order/customer/{customerId}` - Get customer orders (authenticated)

#### Staff Management Endpoints (Staff/Manager/Admin)
- `POST /api/staff/shift/{shiftId}/apply` - Apply to shift (staff+)
- `GET /api/staff/application` - Get all applications (staff+)
- `DELETE /api/staff/application/{applicationId}` - Withdraw application (staff+)
- `GET /api/staff/assignment` - Get all assignments (staff+)
- `GET /api/staff/schedule/weekly` - Get weekly schedule (staff+)
- `GET /api/staff/shift` - Get all shifts (staff+)
- `POST /api/staff/shift` - Create new shift (manager+)
- `POST /api/staff/shift/{shiftId}/assign` - Assign staff to shift (manager+)
- `DELETE /api/staff/assignment/{assignmentId}` - Remove assignment (manager+)
- `PUT /api/staff/application/{applicationId}/decline` - Decline application (manager+)

#### Time-Off Management Endpoints (Staff/Manager/Admin)
- `POST /api/staff/timeoff` - Submit time-off request (staff+)
- `GET /api/staff/timeoff` - Get all time-off requests (staff+)
- `DELETE /api/staff/timeoff/{requestId}` - Withdraw time-off request (staff+)
- `PUT /api/staff/timeoff/{requestId}/approve` - Approve time-off request (manager+)
- `PUT /api/staff/timeoff/{requestId}/deny` - Deny time-off request (manager+)

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

## 2. Get Menu Items (Public)

**Request Method:** GET  
**URL:** `http://localhost:5000/api/order/menu`  
**Headers:** None (Public endpoint)
**Query Parameters (Optional):**
- `category` - Filter by category (food, drinks)
- `available` - Set to "true" to show only available items
- `search` - Search by name or description

---

## 3. Create Order (Customer)

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

## 4. Get Order Details (Customer/Staff)

**Request Method:** GET  
**URL:** `http://localhost:5000/api/order/{orderId}`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None

---

## 5. Confirm Order (Customer)

**Request Method:** PUT  
**URL:** `http://localhost:5000/api/order/{orderId}/confirm`  
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

## 6. Get Order Status (Customer/Staff)

**Request Method:** GET  
**URL:** `http://localhost:5000/api/order/{orderId}/status`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None

---

## 7. Update Order Status (Staff Only)

**Request Method:** PUT  
**URL:** `http://localhost:5000/api/order/{orderId}/status`  
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
**Valid Status Transitions:**
- `placed` → `in_kitchen` or `cancelled`
- `in_kitchen` → `ready`
- `ready` → `served`
- `served` → `closed`

**Notes:** Only staff with manager/admin roles can update order status. Inventory is decremented when moving to `in_kitchen`.

---

## 8. Get Customer Order History (Customer/Staff)

**Request Method:** GET  
**URL:** `http://localhost:5000/api/order/customer/{customerId}`  
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

## Staff Management Endpoints

### Staff Endpoints (Staff/Manager/Admin Only)

#### 1. Apply to Shift

**Request Method:** POST  
**URL:** `http://localhost:5000/api/staff/shift/{shiftId}/apply`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```
**Request Body:**
```json
{
  "desiredRequirementId": 123
}
```
**Notes:**
- `desiredRequirementId` is optional - specifies which role you want to apply for
- Applications are auto-approved
- Cannot apply if already assigned to the shift
- Cannot apply if it would create overlapping shifts

#### 2. Get All Applications

**Request Method:** GET  
**URL:** `http://localhost:5000/api/staff/application`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None  
**Notes:** Staff can see all applications (not just their own)

#### 3. Withdraw Application

**Request Method:** DELETE  
**URL:** `http://localhost:5000/api/staff/application/{applicationId}`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None  
**Notes:** 
- Staff can only withdraw their own applications
- Cannot withdraw if already assigned to shift
- Managers can withdraw any application

#### 4. Get All Assignments

**Request Method:** GET  
**URL:** `http://localhost:5000/api/staff/assignment`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None  
**Notes:** Staff can see all assignments (not just their own)

#### 5. Get Weekly Schedule

**Request Method:** GET  
**URL:** `http://localhost:5000/api/staff/schedule/weekly`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Query Parameters (Required):**
- `startDate` - Start date in YYYY-MM-DD format
- `endDate` - End date in YYYY-MM-DD format

**Example:** `http://localhost:5000/api/staff/schedule/weekly?startDate=2025-09-30&endDate=2025-10-06`

#### 6. Get All Shifts

**Request Method:** GET  
**URL:** `http://localhost:5000/api/staff/shift`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Query Parameters (Optional):**
- `startDate` - Filter shifts from this date (YYYY-MM-DD)
- `endDate` - Filter shifts up to this date (YYYY-MM-DD)
- `templateId` - Filter by shift template (morning/afternoon/evening)

### Manager Endpoints (Manager/Admin Only)

#### 7. Create New Shift

**Request Method:** POST  
**URL:** `http://localhost:5000/api/staff/shift`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```
**Request Body:**
```json
{
  "shiftDate": "2025-10-01",
  "templateId": 1,
  "requirements": [
    {
      "roleName": "server",
      "requiredCount": 3
    },
    {
      "roleName": "cook",
      "requiredCount": 2
    }
  ],
  "notes": "Busy day expected - ensure full staff"
}
```
**Notes:**
- `templateId`: 1=morning, 2=afternoon, 3=evening (check your shift templates)
- Cannot create duplicate shifts for same date and template
- `notes` field is optional

#### 8. Assign Staff to Shift

**Request Method:** POST  
**URL:** `http://localhost:5000/api/staff/shift/{shiftId}/assign`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```
**Request Body:**
```json
{
  "staffId": 456,
  "requirementId": 789
}
```
**Notes:**
- Can assign staff who didn't apply to the shift  
- Validates against over-staffing
- Prevents overlapping shift assignments
- `requirementId` specifies which role to assign to

#### 9. Remove Staff Assignment

**Request Method:** DELETE  
**URL:** `http://localhost:5000/api/staff/assignment/{assignmentId}`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None

#### 10. Decline Application

**Request Method:** PUT  
**URL:** `http://localhost:5000/api/staff/application/{applicationId}/decline`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None  
**Notes:** Cannot decline if staff is already assigned to the shift

---

## Time-Off Management Endpoints

### Staff Endpoints (Staff/Manager/Admin Only)

#### 11. Submit Time-Off Request

**Request Method:** POST  
**URL:** `http://localhost:5000/api/staff/timeoff`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```
**Request Body:**
```json
{
  "startDate": "2025-10-05",
  "endDate": "2025-10-07",
  "reason": "Personal leave"
}
```
**Notes:**
- `startDate` and `endDate` are required in YYYY-MM-DD format
- `reason` is optional
- End date must be after start date
- Request automatically starts with "pending" status

#### 12. Get All Time-Off Requests

**Request Method:** GET  
**URL:** `http://localhost:5000/api/staff/timeoff`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Query Parameters (Optional):**
- `status` - Filter by status (pending/approved/denied)
- `startDate` - Filter requests from this date (YYYY-MM-DD)
- `endDate` - Filter requests up to this date (YYYY-MM-DD)

**Example:** `http://localhost:5000/api/staff/timeoff?status=pending&startDate=2025-10-01&endDate=2025-10-31`

**Notes:** Staff can see all time-off requests (not just their own)

#### 13. Withdraw Time-Off Request

**Request Method:** DELETE  
**URL:** `http://localhost:5000/api/staff/timeoff/{requestId}`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None  
**Notes:** 
- Staff can only withdraw their own pending requests
- Cannot withdraw approved or denied requests
- Managers can withdraw any pending request

### Manager Endpoints (Manager/Admin Only)

#### 14. Approve Time-Off Request

**Request Method:** PUT  
**URL:** `http://localhost:5000/api/staff/timeoff/{requestId}/approve`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None  
**Notes:** 
- Only pending requests can be approved
- Automatically updates staff status to UNAVAILABLE for those dates
- Prevents shift assignments during approved time-off period

#### 15. Deny Time-Off Request

**Request Method:** PUT  
**URL:** `http://localhost:5000/api/staff/timeoff/{requestId}/deny`  
**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
```
**Request Body:** None  
**Notes:** Only pending requests can be denied

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