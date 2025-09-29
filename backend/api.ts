import { Router} from "express";
// import { authentication } from "../middleware/authmiddleware";
// import validator from "../utils/validator";
// import { userCreationSchema, userLoginSchema } from "../schemas/userschema";
// import { createUser, loginUser } from "../controllers/users";
const authRouter = Router();

// authRouter.post("/register", validator.body(userCreationSchema), createUser)
// authRouter.post("/login", validator.body(userLoginSchema), loginUser)
// authRouter.get("/test", authentication, (req, res) => res.status(200).json({
//     data: req["currentUser"],
//     message: "User is authenticated"
// }))
export default authRouter;
