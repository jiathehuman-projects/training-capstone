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
  getMenuItems
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

orderRouter.get("/menu", getMenuItems);

orderRouter.post("/", authentication, validator.body(createOrderSchema), createOrder);

orderRouter.get("/:orderId", authentication, getOrder);

orderRouter.put("/:orderId/confirm", authentication, validator.body(confirmOrderSchema), confirmOrder);

orderRouter.get("/:orderId/status", authentication, getOrderStatus);

orderRouter.get("/customer/:customerId", authentication, getCustomerOrders);

orderRouter.put("/:orderId/status", authentication, validator.body(updateOrderStatusSchema), updateOrderStatus);

export default orderRouter;