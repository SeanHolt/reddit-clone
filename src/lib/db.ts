import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let prismaClient: PrismaClient;

if (globalForPrisma.prisma) {
  prismaClient = globalForPrisma.prisma;
} else {
  // Prisma v7 simplification: Pass the options directly into PrismaLibSQL
  // We don't instantiate or import 'createClient' manually anymore.
  const adapter = new PrismaLibSql({
    url: "file:prisma/dev.db",
  });

  prismaClient = new PrismaClient({ adapter });
}

export const db = prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
