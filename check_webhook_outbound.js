const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.callLog.findMany({
    where: { provider: 'BONVOICE', direction: 'OUTBOUND' },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  logs.forEach(log => console.log('Log:', JSON.stringify(log.providerWebhook, null, 2)));
}
main().catch(console.error);
