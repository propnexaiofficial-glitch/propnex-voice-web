const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const log = await prisma.callLog.findFirst({
    where: { provider: 'BONVOICE' },
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(log.providerWebhook, null, 2));
}
main().catch(console.error);
