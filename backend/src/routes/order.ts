import { Router} from "express";
import { authentication } from "../middleware/authmiddleware";
import validator from "../utils/validator";
import { userCreationSchema, userLoginSchema } from "../schemas/authSchema";
import { register, login } from "../controllers/userAuth";

const orderRouter = Router();

// customer creates a new order
orderRouter.post("/order")
orderRouter.post("/login")

export default orderRouter;
