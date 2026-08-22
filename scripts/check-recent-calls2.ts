import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const allCalls = await prisma.callLog.findMany({
    orderBy: { startedAt: 'desc' },
    take: 20
  });

  console.log("Recent Calls:");
  console.log(JSON.stringify(allCalls.map(c => ({ 
    id: c.id, 
    callLogId: c.callLogId, 
    companyId: c.companyId,
    phone: (c.providerWebhook as any)?.phone
  })), null, 2));
}

main().finally(() => prisma.$disconnect());
