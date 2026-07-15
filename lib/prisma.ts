import path from "node:path";
import { PrismaClient } from "@/app/generated/prisma/client";

// SQLite path resolved from the process cwd at runtime. Relative file: URLs
// break under Turbopack (the generated client's __dirname points into .next
// chunks), and absolute paths in .env break whenever the project folder is
// renamed — this survives both.
const datasourceUrl = "file:" + path.join(process.cwd(), "prisma", "dev.db");

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
