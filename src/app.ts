import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { prot } from './config/secret';
import NodeCache from 'node-cache';
import router from './app/route/route';
import GlobalErrorHandler from './app/middleware/globalErrorHandler';
import { MongoClient } from "mongodb"
import { StatusCodes } from 'http-status-codes';
import { PrismaConnection } from './shared/PrismaConnection';

export const myCache = new NodeCache({ stdTTL: 180 })
const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Welcome to development world');
});

const connectDB = async () => {
    try {
        const conn = await new MongoClient(process.env.DATABASE_URL as string).connect();
        console.log(`MongoDB Connected Successfully`);
        PrismaConnection()
    } catch (error: any) {
        console.error(`Error: ${error?.message}`);
        process.exit(1); // Exit process with failure
    }
};

connectDB()

app.use("/api/v1", router)
app.use(GlobalErrorHandler)


app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "API NOT FOUND!",
        error: {
            path: req.originalUrl,
            message: "Your requested path is not found!",
        },
    });
});



app.listen(prot, () => {
    console.log(`Server is running on port ${prot}`);
});
