import { Router } from "express"
import { validateLoginUser, validateRegisterUser } from "../validator/auth.validator.js";
import { getMe, googleCallback, login, register } from "../controllers/auth.controller.js";
import passport from "passport";
import { authenticateUser } from "../middleware/auth.middleware.js";


const router = Router()

router.post("/register", validateRegisterUser, register )

router.post("/login", validateLoginUser, login )

router.get("/google", passport.authenticate("google", { scope: ["profile", "email" ] }))

router.get("/google/callback", passport.authenticate("google", {session:false ,
         failureRedirect: "http://localhost:5173/login"}),
googleCallback
)

router.get("/me", authenticateUser,  getMe)

export default router;