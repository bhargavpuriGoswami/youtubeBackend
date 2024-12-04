import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

const app = express();
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)

// common middleware
app.use(bodyParser.json({limit:"16kb"}))
app.use(bodyParser.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//import routes
import healthcheckRouter from './routes/healthcheck.routes.js';
import userRouter from './routes/user.routes.js'
import { errorHandler } from './middleware/error.middleware.js';


//routes
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/user",userRouter)
app.use(errorHandler)

export {app}