import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || "mongodb://propnexaiofficial_db_user:KccmbOVh4GsZp1Ok@ac-bwr5uzv-shard-00-00.vuuzm1i.mongodb.net:27017,ac-bwr5uzv-shard-00-01.vuuzm1i.mongodb.net:27017,ac-bwr5uzv-shard-00-02.vuuzm1i.mongodb.net:27017/propnex?ssl=true&authSource=admin&replicaSet=atlas-j95wo5-shard-0&retryWrites=true&w=majority&appName=Cluster0",
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
