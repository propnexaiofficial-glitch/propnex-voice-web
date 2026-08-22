import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const calls = await prisma.callLog.findMany({ where: { callLogId: 'mock-test-demmo-001' } });
  console.log(JSON.stringify(calls.map(c => c.companyId), null, 2));
}
main().finally(() => prisma.$disconnect());
