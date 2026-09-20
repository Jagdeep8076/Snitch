import { Router } from "express"
import { validateLoginUser, validateRegisterUser } from "../validator/auth.validator.js";
import { login, register } from "../controllers/auth.controller.js";
import passport from "passport";


const router = Router()

router.post("/register", validateRegisterUser, register )

router.post("/login", validateLoginUser, login )

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email" ] }))

router.get("/auth/google/callback", passport.authenticate("google", {session:false }),

)



export default router;