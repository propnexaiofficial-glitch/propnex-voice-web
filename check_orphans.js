const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.callLog.findMany({
    where: { provider: 'BONVOICE', direction: 'OUTBOUND' },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  const type0 = logs.find(l => l.providerWebhook && l.providerWebhook.callType === '0');
  const type1 = logs.find(l => l.providerWebhook && l.providerWebhook.callType === '1');
  console.log("Found callType 0 (Ringing)?", !!type0);
  console.log("Found callType 1 (Answered)?", !!type1);
  
  // Find any orphan logs without publicId
  const orphans = await prisma.callLog.findMany({
    where: { provider: 'BONVOICE', publicId: { startsWith: 'bonvoice-' } },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(`Found ${orphans.length} orphan logs from webhooks!`);
  if (orphans.length > 0) {
    console.log(JSON.stringify(orphans[0].providerWebhook, null, 2));
  }
}
main().catch(console.error);
