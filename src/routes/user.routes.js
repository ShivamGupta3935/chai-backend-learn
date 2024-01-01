import { Router } from "express";
import { logoutUser, registerUser } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verify } from "jsonwebtoken";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        {
          name: "avatar",
          maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    
    registerUser
)
router.route("/login").post(logoutUser)

//secure route
router.route("/logout").post(verifyJWT, logoutUser)


export default router