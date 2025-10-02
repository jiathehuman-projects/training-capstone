import { Router } from 'express';
import { authentication } from '../middleware/authmiddleware';
import { requireManagerOrAdmin } from '../middleware/roleMiddleware';
import { 
  createMenuItem, 
  getMenuItems,
  getPublicMenuItems, 
  getMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  getCategories,
  upload
} from "../controllers/menu";

const menuRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MenuItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         price:
 *           type: number
 *         description:
 *           type: string
 *         photoUrl:
 *           type: string
 *         preparationTimeMin:
 *           type: integer
 *         costOfGoods:
 *           type: number
 *         allergens:
 *           type: array
 *           items:
 *             type: string
 *         promoPercent:
 *           type: number
 *         promoStartsAt:
 *           type: string
 *         promoEndsAt:
 *           type: string
 *         qtyOnHand:
 *           type: integer
 *         reorderThreshold:
 *           type: integer
 *         reorderStatus:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *   tags:
 *   - name: Staff Menu Management
 *     description: Menu item management endpoints for managers and admins
 */

/**
 * @swagger
 * /api/staff/menu:
 *   post:
 *     summary: Create a new menu item
 *     tags: [Staff Menu Management]
 *     security:
 *       - bearerAuth: []
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
 *               image:
 *                 type: string
 *                 format: binary
 *               preparationTimeMin:
 *                 type: integer
 *               costOfGoods:
 *                 type: number
 *               allergens:
 *                 type: array
 *                 items:
 *                   type: string
 *               promoPercent:
 *                 type: number
 *               promoStartsAt:
 *                 type: string
 *               promoEndsAt:
 *                 type: string
 *               qtyOnHand:
 *                 type: integer
 *               reorderThreshold:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
menuRouter.post("/", authentication, requireManagerOrAdmin, upload.single('image'), createMenuItem);

/**
 * @swagger
 * /api/staff/menu:
 *   get:
 *     summary: Get all menu items with filtering and pagination
 *     tags: [Staff Menu Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, category, price, createdAt, updatedAt]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
/**
 * @swagger
 * /api/staff/menu/public:
 *   get:
 *     summary: Get active menu items (Public access for customers)
 *     tags: [Public Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
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
 *         description: List of active menu items
 *       401:
 *         description: Unauthorized
 */
menuRouter.get("/public", getPublicMenuItems);

menuRouter.get("/", authentication, requireManagerOrAdmin, getMenuItems);

/**
 * @swagger
 * /api/staff/menu/categories:
 *   get:
 *     summary: Get all menu categories
 *     tags: [Staff Menu Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
menuRouter.get("/categories", authentication, requireManagerOrAdmin, getCategories);

/**
 * @swagger
 * /api/staff/menu/{id}:
 *   get:
 *     summary: Get a specific menu item
 *     tags: [Staff Menu Management]
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
menuRouter.get("/:id", authentication, requireManagerOrAdmin, getMenuItem);

/**
 * @swagger
 * /api/staff/menu/{id}:
 *   put:
 *     summary: Update a menu item
 *     tags: [Staff Menu Management]
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
 *               image:
 *                 type: string
 *                 format: binary
 *               preparationTimeMin:
 *                 type: integer
 *               costOfGoods:
 *                 type: number
 *               allergens:
 *                 type: array
 *                 items:
 *                   type: string
 *               promoPercent:
 *                 type: number
 *               promoStartsAt:
 *                 type: string
 *               promoEndsAt:
 *                 type: string
 *               qtyOnHand:
 *                 type: integer
 *               reorderThreshold:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Menu item not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
menuRouter.put("/:id", authentication, requireManagerOrAdmin, upload.single('image'), updateMenuItem);

/**
 * @swagger
 * /api/staff/menu/{id}:
 *   delete:
 *     summary: Delete a menu item
 *     tags: [Staff Menu Management]
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
menuRouter.delete("/:id", authentication, requireManagerOrAdmin, deleteMenuItem);

export default menuRouter;