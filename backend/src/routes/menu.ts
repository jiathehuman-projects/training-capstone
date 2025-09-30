import { Router } from "express";
import { authentication } from "../middleware/authmiddleware";
import { requireManagerOrAdmin } from "../middleware/roleMiddleware";
import { 
  createMenuItem, 
  getMenuItems, 
  getMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  upload
} from "../controllers/menu";

const menuRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Menu Management
 *     description: Menu item management endpoints for managers and admins
 */

/**
 * @swagger
 * /api/menu:
 */
menuRouter.post("/", authentication, requireManagerOrAdmin, upload.single('image'), createMenuItem);

/**
 * @swagger
 * /api/menu:
 */
menuRouter.get("/", authentication, requireManagerOrAdmin, getMenuItems);

/**
 * @swagger
 * /api/menu/{id}:
 */
menuRouter.get("/:id", authentication, requireManagerOrAdmin, getMenuItem);

/**
 * @swagger
 * /api/menu/{id}:

 */
menuRouter.put("/:id", authentication, requireManagerOrAdmin, upload.single('image'), updateMenuItem);

/**
 * @swagger
 * /api/menu/{id}:
 */
menuRouter.delete("/:id", authentication, requireManagerOrAdmin, deleteMenuItem);

export default menuRouter;