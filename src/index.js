import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import { validateGeminiConfig } from "./utils/gemini.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import projectRoutes from "./routes/project.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ── Startup checks ────────────────────────────────────────────────────────────
validateGeminiConfig();
await connectDB();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API server
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: '*', // Allow ALL origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));

// ── Parsing ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Force JSON responses ──────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});


// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ success: true, service: "AI Interviewer Backend", status: "healthy", timestamp: new Date().toISOString() }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/projects", projectRoutes);

// ── 404 + Error handler ───────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, error: `${req.method} ${req.originalUrl} not found` }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Backend running on http://localhost:${PORT}`);
  console.log(`🤖 Gemini: ${process.env.GEMINI_MODEL || "gemini-2.0-flash"}`);
  console.log(`📦 MongoDB: ${process.env.MONGODB_URI || "mongodb://localhost:27017/ai-interviewer"}\n`);
});

export default app;
