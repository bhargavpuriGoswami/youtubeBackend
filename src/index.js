import {app} from "./app.js"
import dotenv from "dotenv"
import connectDB from "./db/index.js";


dotenv.config({
    path:'./.env'
})

const PORT = process.env.PORT || 3000;


connectDB()
.then(()=>{
    app.listen(PORT,()=>{

        console.log(`Server is running on 127.0.0.1/${PORT}`);
    })
})
.catch((err)=>{
    console.log('MongoDB connection error', err);
})


