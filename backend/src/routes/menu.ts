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
 *   post:
 *     summary: Create a new menu item
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *               - description
 *               - qtyOnHand
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               qtyOnHand:
 *                 type: integer
 *               preparationTimeMin:
 *                 type: integer
 *               costOfGoods:
 *                 type: number
 *               reorderThreshold:
 *                 type: integer
 *               allergens:
 *                 type: string
 *                 description: JSON array of allergen strings
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Access denied - Manager or Admin role required
 */
menuRouter.post("/", authentication, requireManagerOrAdmin, upload.single('image'), createMenuItem);

/**
 * @swagger
 * /api/menu:
 *   get:
 *     summary: Get all menu items
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of menu items
 *       403:
 *         description: Access denied - Manager or Admin role required
 */
menuRouter.get("/", authentication, requireManagerOrAdmin, getMenuItems);

/**
 * @swagger
 * /api/menu/{id}:
 *   get:
 *     summary: Get a specific menu item
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menu item details
 *       404:
 *         description: Menu item not found
 *       403:
 *         description: Access denied - Manager or Admin role required
 */
menuRouter.get("/:id", authentication, requireManagerOrAdmin, getMenuItem);

/**
 * @swagger
 * /api/menu/{id}:
 *   put:
 *     summary: Update a menu item
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               qtyOnHand:
 *                 type: integer
 *               preparationTimeMin:
 *                 type: integer
 *               costOfGoods:
 *                 type: number
 *               reorderThreshold:
 *                 type: integer
 *               allergens:
 *                 type: string
 *                 description: JSON array of allergen strings
 *               isActive:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *       404:
 *         description: Menu item not found
 *       403:
 *         description: Access denied - Manager or Admin role required
 */
menuRouter.put("/:id", authentication, requireManagerOrAdmin, upload.single('image'), updateMenuItem);

/**
 * @swagger
 * /api/menu/{id}:
 *   delete:
 *     summary: Delete a menu item (soft delete)
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 *       404:
 *         description: Menu item not found
 *       403:
 *         description: Access denied - Manager or Admin role required
 */
menuRouter.delete("/:id", authentication, requireManagerOrAdmin, deleteMenuItem);

export default menuRouter;