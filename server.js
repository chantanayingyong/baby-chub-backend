import express from "express";
import helmet from "helmet";
import cors from "cors";
import apiRoutes from "./api/v1/routes.js";
import { connectMongo } from "./config/mongo.js";
import limiter from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import libraryRoutes from "./routes/libraryRoutes.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(cookieParser());
app.use("/", apiRoutes());
app.use("/api", libraryRoutes);

app.get("/", (_req, res) => {
  res.send(`
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>BabyChub</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background: #f7f9fc;
            color: #333;
            text-align: center;
            padding: 50px;
          }
          h1 {
            font-size: 2.5rem;
            color: #2c3e50;
          }
          p {
            font-size: 1.2rem;
            margin-top: 1rem;
          }
          code {
            background: #eee;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-size: 0.95rem;
          }
          .container {
            max-width: 600px;
            margin: auto;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📒 Welcome to the BabyChub API</h1>
        </div>
      </body>
      </html>
    `);
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectMongo();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT} ✅`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
})();

// Handle unhandled promise rejections globally
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err.message);
  process.exit(1);
});
