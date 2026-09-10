const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const date = new Date('2026-09-09');
  const calls = await prisma.callLog.findMany({
    where: { createdAt: { gte: date } },
    orderBy: { createdAt: 'desc' }
  });
  console.log(`Found ${calls.length} calls since ${date.toISOString()}`);
  if (calls.length > 0) {
    console.log(JSON.stringify(calls, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
