import "dotenv/config";
import app from "./backend/app.js";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Fallbacks for Razorpay Test Credentials if env isn't passed directly
if (!process.env.RAZORPAY_KEY_ID) {
  process.env.RAZORPAY_KEY_ID = "rzp_test_TLOiljEb7Dy8FA";
}
if (!process.env.RAZORPAY_KEY_SECRET) {
  process.env.RAZORPAY_KEY_SECRET = "fFp8o4MQ9S5qDrDvDP1a6HDv";
}

const PORT = process.env.PORT || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 College ERP Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
