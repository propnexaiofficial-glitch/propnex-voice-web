const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.callLog.findMany({
    where: { provider: 'BONVOICE' },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  const answered = logs.filter(l => 
    l.providerWebhook && 
    (
      l.providerWebhook.callType == '1' || 
      (l.providerWebhook.Status && l.providerWebhook.Status.toString().toUpperCase() === 'ANSWERED')
    )
  );
  console.log(`Found ${answered.length} ANSWERED webhooks out of 50`);
  
  if (answered.length > 0) {
     const notHangup = answered.filter(l => l.providerWebhook.callType != '2');
     console.log(`Found ${notHangup.length} ANSWERED webhooks that are NOT hangup (callType != 2)`);
     if (notHangup.length > 0) {
        console.log("Example:", JSON.stringify(notHangup[0].providerWebhook, null, 2));
     }
  }
}
main().catch(console.error);
