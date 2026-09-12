const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.callLog.findMany({
    where: { provider: 'BONVOICE' },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  const type1 = logs.find(l => l.providerWebhook && l.providerWebhook.callType === '1');
  console.log("callType 1 found:", !!type1);
  if (type1) console.log(JSON.stringify(type1.providerWebhook, null, 2));
}
main().catch(console.error);
