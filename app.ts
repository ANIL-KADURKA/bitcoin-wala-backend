import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import bodyParser from "body-parser";
import { sequelize } from "./src/connection/connection";
import cors from "cors";
import { router } from "./src/routes/router";

import { adminRouter } from "./src/routes/admin-registration";

const app = express();
const port: number = parseInt(process.env.PORT || "5000");

app.use(cors());
app.use(express.json());
app.use("/", router);
app.get("/", async (req, res) => {
  res.status(200).send({ message: "pong" });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync({force:true});
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
