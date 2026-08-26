const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanup() {
  const result = await prisma.callLog.updateMany({
    where: { status: "PENDING" },
    data: { status: "FAILED" },
  });
  console.log(`Cleaned up ${result.count} pending calls.`);
}
cleanup().finally(() => prisma.$disconnect());
