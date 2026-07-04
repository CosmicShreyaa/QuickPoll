import express from "express";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { attachUser } from "./middleware/auth.js";
import { authRouter } from "./routes/auth.routes.js";
import { pollsRouter } from "./routes/polls.routes.js";

export const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
  }),
);
app.use(express.json());

// Ensure a DB connection exists before any route runs (cached after the
// first invocation, so this is a no-op on warm serverless containers).
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use(attachUser);

// Routes are mounted under /api so the same paths work whether this app is
// run standalone (npm start) or deployed as a serverless function behind a
// rewrite that preserves the original request path (e.g. Vercel's
// "/api/(.*)" -> "api/index.js" rule).
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/polls", pollsRouter);

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (err?.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  if (err?.code === 11000) {
    return res.status(409).json({ error: "Duplicate value" });
  }
  res.status(500).json({ error: "Internal server error" });
});
