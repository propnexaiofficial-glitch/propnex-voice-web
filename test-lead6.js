const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const calls = await prisma.callLog.findMany({
    where: { lead: { phone: { contains: "918851860838" } }, status: { not: 'COMPLETED' } },
  });
  console.log(calls.map(c => ({ 
    date: c.startedAt, 
    company: c.companyId,
    corr: c.correlationId
  })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
