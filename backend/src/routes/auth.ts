import { Router} from "express";
import { authentication } from "../middleware/authmiddleware";
import validator from "../utils/validator";
import { userCreationSchema, userLoginSchema } from "../schemas/authSchema";
import { register, login } from "../controllers/userAuth";

const authRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */


authRouter.post("/register", validator.body(userCreationSchema), register)


authRouter.post("/login", validator.body(userLoginSchema), login)

export default authRouter;