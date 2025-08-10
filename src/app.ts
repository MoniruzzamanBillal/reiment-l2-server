import bodyParser from "body-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";

import cookieParser from "cookie-parser";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import { MainRouter } from "./app/router";

const app: Application = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://reiment-l2-client.vercel.app",
      "https://reimentl2.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// ! rouutes
app.use("/api", MainRouter);

app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.send({ message: "server is running  !! " });
  } catch (error) {
    next(error);
  }
});

//! global error handler
app.use(globalErrorHandler);

// ! not found route
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
