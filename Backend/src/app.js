import express from "express"
import cookieParser from "cookie-parser"
import morgon from "morgan"
import authRouter from "./routes/auth.routes.js"

const app = express()

app.use(morgon("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.get("/", (_req, res)=>{
    res.status(200).json({
        message: "Server is running"
    })
})

app.use("/api/auth", authRouter)

export default app