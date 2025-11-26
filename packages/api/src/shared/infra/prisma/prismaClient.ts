import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Load .env from project root BEFORE initializing Prisma
// When running with yarn workspace, cwd is the api package directory
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

// Debug: Log if DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error("⚠️  DATABASE_URL not found in environment variables");
  console.error("Current working directory:", process.cwd());
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
