
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const failedCalls = await prisma.callLog.findMany({
    where: { companyId: '6a8bed4d3f5b7c2eea48418e', direction: 'OUTBOUND', OR: [{status: 'FAILED'}, {status: 'MISSED'}], NOT: { correlationId: { startsWith: 'reactivation-' } } },
    include: { lead: true }
  });
  
  const reactivationLogs = await prisma.callLog.findMany({
    where: { companyId: '6a8bed4d3f5b7c2eea48418e', direction: 'OUTBOUND', correlationId: { startsWith: 'reactivation-' } },
    select: { leadId: true, correlationId: true, lead: { select: { phone: true } } }
  });
  
  let q1Leads = [];
  for (const call of failedCalls) {
      const leadPhone = call.lead?.phone;
      if (!leadPhone) continue;
      q1Leads.push({ id: call.leadId || 'manual-'+leadPhone, phone: leadPhone });
  }
  
  let q2Attempted = 0;
  for (const lead of q1Leads) {
      const q2Log = reactivationLogs.find(l => l.correlationId?.endsWith('-q2') && (l.leadId === lead.id || l.lead?.phone === lead.phone));
      if (q2Log) q2Attempted++;
  }
  
  console.log('Q2 Attempted matches:', q2Attempted);
}
run();

