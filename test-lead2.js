const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const calls = await prisma.callLog.findMany({
    where: { lead: { phone: { contains: "9889479110" } }, status: { not: 'COMPLETED' } },
    include: { lead: true }
  });
  console.log(calls.map(c => ({ 
    date: c.startedAt, 
    company: c.companyId 
  })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
