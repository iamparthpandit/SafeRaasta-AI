import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for React Native app
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (root level for quick testing)
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "SafeRaasta SOS Backend is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use("/api", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`SafeRaasta SOS Backend started`);
  console.log(`${"=".repeat(50)}`);
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🌍 Accessible at: http://localhost:${PORT}`);
  console.log(`📱 On same WiFi: http://192.168.x.x:${PORT} (replace with your IP)`);
  console.log(`${"=".repeat(50)}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Retell API Key: ${process.env.RETELL_API_KEY ? "✓ Configured" : "✗ Missing"}`);
  console.log(`Retell Agent ID: ${process.env.RETELL_AGENT_ID ? "✓ Configured" : "✗ Missing"}`);
  console.log(`Retell From Number: ${process.env.RETELL_FROM_NUMBER ? "✓ Configured" : "✗ Missing"}`);
  console.log(`${"=".repeat(50)}\n`);
});

export default app;
