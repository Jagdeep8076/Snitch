import dotenv from "dotenv"
import app from  "./src/app.js"
import connectDB from "./src/config/db.js"



dotenv.config()

const PORT =process.env.PORT || 3000;

const Server = async () =>{
    try{
        await connectDB()


        app.listen(PORT, ()=>{
            console.log(`server is running on port ${PORT}`);
        })
    }catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1)
    }
}
Server();