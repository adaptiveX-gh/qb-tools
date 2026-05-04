import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import invoicesRoutes from "./routes/invoices.routes.js";
import customersRoutes from "./routes/customers.routes.js";
import itemsRoutes from "./routes/items.routes.js";
import companyRoutes from "./routes/company.routes.js";
import { errorHandler } from "./middleware/error-handler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set true behind HTTPS in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoicesRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/company", companyRoutes);

// In production, serve the Vite-built frontend
const clientDir = path.join(__dirname, "..", "client");
app.use(express.static(clientDir));
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(clientDir, "index.html"));
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);
});
