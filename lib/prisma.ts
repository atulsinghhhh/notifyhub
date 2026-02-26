import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import path from "path";

// Ensure .env is loaded (especially for standalone scripts/workers)
dotenv.config({ path: path.join(process.cwd(), ".env") });

const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

if (!process.env.DATABASE_URL) {
    console.error("[Prisma Debug] DATABASE_URL is UNDEFINED!");
} else {
    console.log("[Prisma Debug] DATABASE_URL length:", process.env.DATABASE_URL.length);
}

const prisma = globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export { prisma };
