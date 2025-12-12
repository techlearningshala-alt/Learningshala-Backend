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
const PORT = process.env.PORT || 4000;

// ✅ Enable CORS for your frontend
app.use(cors({
  origin: ["http://3.111.1.94/","http://localhost:3000","http://localhost:5173","https://3.111.1.94/","https://admin.learningshala.com"], // your frontend public URL
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));

// ✅ Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("combined", { stream }));

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use("/api", routes);
app.use(errorHandler);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
