import express from "express";
import { config } from "dotenv";
import ErrorMiddleware from "./middlewares/Error.js";
import userRoute from "./routes/UserRoutes.js";
import adminRoute from "./routes/adminRoutes.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import "./passport.js"; // Importing passport configuration file
import cors from "cors";
import cron from "node-cron"; // Import node-cron
import axios from "axios";

const app = express();

config({ path: "./config.env" });

// Middleware
app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Session Middleware for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/v1", userRoute);
app.use("/api/v1", adminRoute);

// Root API Route
app.get("/", (req, res) => {
  res.send("Server is working");
});

cron.schedule("*/1 * * * *", async () => {
  try {
    console.log("Running scheduled task: Calling root API every 2 minutes");
    const response = await axios.get("https://rajatshoe-n8vf.onrender.com/"); // Replace with your server's actual URL
    console.log("Scheduled API Response:", response.data);
  } catch (error) {
    console.error("Error in scheduled API call:", error.message);
  }
});

app.use(ErrorMiddleware);

export default app;
