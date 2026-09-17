const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companyId = '6a8bed4d3f5b7c2eea48418e';
  const failedCalls = await prisma.callLog.findMany({
    where: {
      companyId,
      direction: "OUTBOUND",
      AND: [
        {
          OR: [
            { status: { in: ["FAILED", "MISSED", "BUSY", "NO_ANSWER", "CANCELLED"] } },
            { durationSeconds: 0 },
          ]
        },
        {
          OR: [
            { correlationId: { isSet: false } },
            { correlationId: null },
            { correlationId: { not: { startsWith: "reactivation-" } } }
          ]
        }
      ]
    },
    include: { lead: true, phoneNumber: true },
    orderBy: { startedAt: "asc" }
  });

  const buckets = {};
  let currentKey = "";
  const seenPhones = new Set();
  
  for (const call of failedCalls) {
    const d = call.startedAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    
    if (key !== currentKey) {
      currentKey = key;
      seenPhones.clear();
    }

    let fallbackCustomerNumber = "";
    if (call.providerWebhook && typeof call.providerWebhook === 'object') {
       const wh = call.providerWebhook;
       fallbackCustomerNumber = wh.DestinationNumber || wh.destination_number || wh.destinationNumber || wh.caller || wh.to_number || wh.to || wh.customer_number || wh.customerNumber || "";
       const callIdRaw = wh.callID || wh.callId || wh.call_id || wh.uuid;
       if (!fallbackCustomerNumber && callIdRaw && typeof callIdRaw === 'string') {
         const parts = callIdRaw.split('-');
         if (parts.length >= 3) fallbackCustomerNumber = parts[2];
       }
    }
    if (!fallbackCustomerNumber && call.providerRequest && typeof call.providerRequest === 'object') {
       const req = call.providerRequest;
       fallbackCustomerNumber = req.to || req.to_number || req.DestinationNumber || req.customerNumber || "";
    }
    if (!fallbackCustomerNumber && call.providerResponse && typeof call.providerResponse === 'object') {
       const res = call.providerResponse;
       fallbackCustomerNumber = res.to || res.to_number || res.DestinationNumber || res.customerNumber || "";
    }

    const leadPhone = call.lead?.phone || fallbackCustomerNumber;
    if (!leadPhone) continue;
    
    if (seenPhones.has(leadPhone)) continue;
    seenPhones.add(leadPhone);
    
    if (!buckets[key]) {
      buckets[key] = {
        date: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(d),
        leads: [leadPhone]
      };
    } else {
      buckets[key].leads.push(leadPhone);
    }
  }

  console.log("Buckets:", JSON.stringify(buckets, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
