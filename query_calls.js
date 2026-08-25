const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const calls = await prisma.callLog.findMany({ 
    where: { companyId: '6a8bed4d3f5b7c2eea48418e' },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  calls.forEach(c => console.log(JSON.stringify(c, null, 2)));
}
main().catch(console.error).finally(() => prisma.$disconnect());
