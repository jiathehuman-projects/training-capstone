import { Router } from "express";
import { authentication } from "../middleware/authmiddleware";
import validator from "../utils/validator";
import { 
  createOrder, 
  getOrder, 
  confirmOrder, 
  getOrderStatus, 
  getCustomerOrders,
  updateOrderStatus,
  getMenuItems,
  getAllOrdersForStaff
} from "../controllers/order";
import { createOrderSchema, confirmOrderSchema, updateOrderStatusSchema } from "../schemas/orderSchema";

const orderRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Menu
 *     description: Menu management endpoints
 *   - name: Orders
 *     description: Order management endpoints
 */

/**
 * @swagger
 * /orders/order:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tableNumber
 *               - orderItems
 *             properties:
 *               tableNumber:
 *                 type: integer
 *                 minimum: 1
 *                 example: 5
 *                 description: "Table number for the order"
 *               orderItems:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - menuItemId
 *                     - quantity
 *                   properties:
 *                     menuItemId:
 *                       type: integer
 *                       example: 1
 *                       description: "ID of the menu item"
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 2
 *                       description: "Quantity of this item"
 *                     customizations:
 *                       type: string
 *                       example: "No onions, extra cheese"
 *                       description: "Special instructions for this item"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order created successfully"
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
orderRouter.post("/order", authentication, validator.body(createOrderSchema), createOrder);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
orderRouter.get("/:orderId", authentication, getOrder);

/**
 * @swagger
 * /orders/{orderId}/confirm:
 *   put:
 *     summary: Confirm an order (transition from DRAFT to CONFIRMED)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMode:
 *                 type: string
 *                 enum: [CASH, CARD, DIGITAL_WALLET]
 *                 example: "CARD"
 *                 description: "Payment method for the order"
 *     responses:
 *       200:
 *         description: Order confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order confirmed successfully"
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Order cannot be confirmed (not in DRAFT status)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
orderRouter.put("/:orderId/confirm", authentication, validator.body(confirmOrderSchema), confirmOrder);

/**
 * @swagger
 * /orders/{orderId}/status:
 *   get:
 *     summary: Get order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Order status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: integer
 *                   example: 1
 *                 status:
 *                   type: string
 *                   enum: [DRAFT, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED]
 *                   example: "PREPARING"
 *                 estimatedTime:
 *                   type: integer
 *                   example: 25
 *                   description: "Estimated time in minutes (if applicable)"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
orderRouter.get("/:orderId/status", authentication, getOrderStatus);

/**
 * @swagger
 * /orders/customer/{customerId}:
 *   get:
 *     summary: Get all orders for a specific customer
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Customer orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
orderRouter.get("/customer/:customerId", authentication, getCustomerOrders);

/**
 * @swagger
 * /orders/staff/orders:
 *   get:
 *     summary: Get all orders for staff (kitchen/service staff)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions (staff access required)
 *       500:
 *         description: Server error
 */
orderRouter.get("/staff/orders", authentication, getAllOrdersForStaff);

/**
 * @swagger
 * /orders/{orderId}/status:
 *   put:
 *     summary: Update order status (staff only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED]
 *                 example: "READY"
 *                 description: "New status for the order"
 *               estimatedTime:
 *                 type: integer
 *                 example: 15
 *                 description: "Estimated completion time in minutes (optional)"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order status updated successfully"
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions (staff access required)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
orderRouter.put("/:orderId/status", authentication, validator.body(updateOrderStatusSchema), updateOrderStatus);

export default orderRouter;