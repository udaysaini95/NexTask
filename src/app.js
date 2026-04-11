import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});
import cookieParser from 'cookie-parser';




const app = express();
const port = process.env.PORT || 3000;


// basic configurations
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(cookieParser());


//cors
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// import routes here
import healthcheckRouter from './routes/healthcheck.routes.js';
import authRouter from './routes/auth.routes.js';

app.use('/api/v1/healthcheck', healthcheckRouter);
app.use('/api/v1/auth', authRouter);






export default app;