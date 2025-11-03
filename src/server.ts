import express, { Application } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { stream } from "./utills/logger";
import cors from "cors";
import path from "path";



dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.urlencoded({ extended: true }));
app.use(cors()); 
app.use(express.json());
app.use(morgan("combined", { stream })); // HTTP request logging

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use("/api", routes);
app.use(errorHandler); // Global error handler

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
