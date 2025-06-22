import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { sequelize } from "./src/connection/connection";
import cors from "cors";
import { router } from "./src/routes/router";
import { announcementRouter } from "./src/routes/announcement";
import bodyParser from "body-parser";

const app = express();
const port: number = parseInt(process.env.PORT || "5000");

const allowedOrigins = ["http://localhost:5173", "https://bitcoinwala.ai"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(express.json());

// ✅ Serve static images
app.use("/uploads", express.static("uploads")); 



// ✅ API routes
app.use("/", router);
app.use("/announcement", announcementRouter);

// ✅ Health check route
app.get("/", async (req, res) => {
  res.status(200).send({ message: "pong" });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("Database connected.");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err: any) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};

startServer();
