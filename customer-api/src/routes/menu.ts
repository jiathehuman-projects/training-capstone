import { Router } from "express";
import { authentication } from "../middleware/authmiddleware";
import { requireManagerOrAdmin } from "../middleware/roleMiddleware";
import { 
  createMenuItem, 
  getMenuItems, 
  getMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  getCategories,
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
 * /menu:
 *   post:
 *     summary: Create a new menu item (Managers/Admins only)
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
 *               - description
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Margherita Pizza"
 *                 description: "Name of the menu item"
 *               description:
 *                 type: string
 *                 example: "Classic pizza with tomato sauce, mozzarella, and fresh basil"
 *                 description: "Detailed description of the menu item"
 *               price:
 *                 type: number
 *                 format: decimal
 *                 example: 12.99
 *                 description: "Price of the menu item"
 *               category:
 *                 type: string
 *                 enum: [APPETIZER, MAIN_COURSE, DESSERT, BEVERAGE]
 *                 example: "MAIN_COURSE"
 *                 description: "Category of the menu item"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "Image file for the menu item (optional)"
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *                 description: "Availability status (defaults to true)"
 *               preparationTime:
 *                 type: integer
 *                 example: 15
 *                 description: "Preparation time in minutes (optional)"
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Menu item created successfully"
 *                 menuItem:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions (Manager/Admin required)
 *       500:
 *         description: Server error
 */
menuRouter.post("/", authentication, requireManagerOrAdmin, upload.single('image'), createMenuItem);

/**
 * @swagger
 * /menu:
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
 *           enum: [APPETIZER, MAIN_COURSE, DESSERT, BEVERAGE]
 *         description: Filter by category (optional)
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability status (optional)
 *     responses:
 *       200:
 *         description: Menu items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MenuItem'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
menuRouter.get("/", authentication, getMenuItems);

/**
 * @swagger
 * /menu/categories:
 *   get:
 *     summary: Get all menu categories
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [APPETIZER, MAIN_COURSE, DESSERT, BEVERAGE]
 *               example: ["APPETIZER", "MAIN_COURSE", "DESSERT", "BEVERAGE"]
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
menuRouter.get("/categories", authentication, getCategories);

/**
 * @swagger
 * /menu/{id}:
 *   get:
 *     summary: Get a specific menu item by ID
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu item ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Menu item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MenuItem'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Server error
 */
menuRouter.get("/:id", authentication, getMenuItem);

/**
 * @swagger
 * /menu/{id}:
 *   put:
 *     summary: Update a menu item (Managers/Admins only)
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu item ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Pizza Name"
 *                 description: "Updated name of the menu item"
 *               description:
 *                 type: string
 *                 example: "Updated description of the pizza"
 *                 description: "Updated description of the menu item"
 *               price:
 *                 type: number
 *                 format: decimal
 *                 example: 14.99
 *                 description: "Updated price of the menu item"
 *               category:
 *                 type: string
 *                 enum: [APPETIZER, MAIN_COURSE, DESSERT, BEVERAGE]
 *                 example: "MAIN_COURSE"
 *                 description: "Updated category of the menu item"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "New image file for the menu item (optional)"
 *               isAvailable:
 *                 type: boolean
 *                 example: false
 *                 description: "Updated availability status"
 *               preparationTime:
 *                 type: integer
 *                 example: 20
 *                 description: "Updated preparation time in minutes"
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Menu item updated successfully"
 *                 menuItem:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions (Manager/Admin required)
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Server error
 */
menuRouter.put("/:id", authentication, requireManagerOrAdmin, upload.single('image'), updateMenuItem);

/**
 * @swagger
 * /menu/{id}:
 *   delete:
 *     summary: Delete a menu item (Managers/Admins only)
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu item ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Menu item deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions (Manager/Admin required)
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Server error
 */
menuRouter.delete("/:id", authentication, requireManagerOrAdmin, deleteMenuItem);

export default menuRouter;