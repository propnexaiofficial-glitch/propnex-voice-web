const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const calls = await prisma.callLog.findMany({
    where: {
      OR: [
        { lead: { phone: { contains: "9889479110" } } }
      ],
      status: { not: 'COMPLETED' }
    },
    include: { lead: true }
  });
  console.log(calls.map(c => ({ 
    id: c.id, 
    date: c.startedAt, 
    status: c.status, 
    dur: c.durationSeconds, 
    lead: c.lead?.phone, 
    wh: !!c.providerWebhook, 
    req: !!c.providerRequest 
  })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
