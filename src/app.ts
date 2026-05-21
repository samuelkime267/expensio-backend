import express from "express";
import { connectDb } from "./config/db";
import authRouter from "./routes/auth.route";
import { errorMiddleware } from "./middleware/error.middleware";
import cookieParser from "cookie-parser";
import { PORT } from "./config/env";
import cors from "cors";
import passport from "passport";
import userRouter from "./routes/user.route";
import morgan from "morgan";
import categoryRouter from "./routes/category.route";
import "@/config/passport";
import transactionRouter from "./routes/transaction.route";

const app = express();

const logger = morgan("dev");
app.use(logger);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(passport.initialize());
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/transaction", transactionRouter);

app.use(errorMiddleware);

connectDb(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    console.log(`BASE URL: http://localhost:${PORT}/api/v1`);
  });
});
