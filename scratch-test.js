const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const companyId = "66f7f3299db321d279cf4bb8"; // Need a real companyId, wait, I can just query one company.
  
  const company = await prisma.company.findFirst();
  if(!company) return console.log("No company");
  console.log("Testing for company", company.id);

  console.time("Raw FindMany");
  const callLogs = await prisma.callLog.findMany({
    where: { companyId: company.id },
    select: { 
      direction: true, 
      status: true, 
      durationSeconds: true,
      cost: true,
      creditsUsed: true,
      startedAt: true,
      phoneNumberId: true,
    }
  });
  console.timeEnd("Raw FindMany");
  console.log("Found", callLogs.length, "calls");

  console.time("GroupBy Status Direction");
  const stats = await prisma.callLog.groupBy({
    by: ['direction', 'status'],
    where: { companyId: company.id },
    _count: { _all: true },
    _sum: { durationSeconds: true, creditsUsed: true },
    _avg: { durationSeconds: true }
  });
  console.timeEnd("GroupBy Status Direction");
  console.log(stats);
  
  console.time("GroupBy Phone Direction");
  const phoneStats = await prisma.callLog.groupBy({
    by: ['phoneNumberId', 'direction'],
    where: { companyId: company.id },
    _count: { _all: true }
  });
  console.timeEnd("GroupBy Phone Direction");
  console.log(phoneStats);
}

run().catch(console.error).finally(() => prisma.$disconnect());
