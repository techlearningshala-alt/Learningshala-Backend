import express, { Application } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { redirectionMiddleware } from "./middlewares/redirection.middleware";
import { stream } from "./utills/logger";
import cors from "cors";
import path from "path";

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 4000;

// Correct req.hostname / req.protocol behind reverse proxies (needed for redirect URL matching)
app.set("trust proxy", true);

// ✅ Enable CORS for your frontend
app.use(cors({
  origin: ["http://3.111.1.94/","http://localhost:3000","http://localhost:5173","https://3.111.1.94/","https://admin.learningshala.com","https://learningshala.vercel.app","https://13.205.148.159, http://13.205.148.159"], // your frontend public URL
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));

// ✅ Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("combined", { stream }));

// DB-backed 301 redirects (old_url → new_url); skips /api and /uploads
app.use(redirectionMiddleware);

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use("/api", routes);
app.use(errorHandler);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
