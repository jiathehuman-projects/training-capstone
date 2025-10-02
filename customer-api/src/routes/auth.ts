import { Router} from "express";
import { authentication } from "../middleware/authmiddleware";
import validator from "../utils/validator";
import { userCreationSchema, userLoginSchema } from "../schemas/authSchema";
import { register, login, updateProfile } from "../controllers/userAuth";

const authRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new customer account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               username:
 *                 type: string
 *                 example: "customer1"
 *                 description: "Unique username for the account"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "customer@example.com"
 *                 description: "Valid email address"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *                 description: "Account password (minimum 6 characters)"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *                 description: "Customer's first name"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *                 description: "Customer's last name"
 *               phone:
 *                 type: string
 *                 example: "+1-555-123-4567"
 *                 description: "Optional phone number"
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registration successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "This email is already registered."
 *       500:
 *         description: Server error
 */
authRouter.post("/register", validator.body(userCreationSchema), register)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to customer account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "customer1"
 *                 description: "Username or email address"
 *               password:
 *                 type: string
 *                 example: "password123"
 *                 description: "Account password"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Server error
 */
authRouter.post("/login", validator.body(userLoginSchema), login)

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update customer profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *                 description: "Updated first name"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *                 description: "Updated last name"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newemail@example.com"
 *                 description: "Updated email address"
 *               phone:
 *                 type: string
 *                 example: "+1-555-987-6543"
 *                 description: "Updated phone number"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "newpassword123"
 *                 description: "New password (optional)"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email already in use"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
authRouter.put("/profile", authentication, updateProfile)

export default authRouter;