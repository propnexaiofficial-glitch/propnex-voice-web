
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const companyId = '6a8bed4d3f5b7c2eea48418e';
  const key = '2026-09-19';
  const compShort = companyId.replace(/-/g, '').slice(0, 8);
  const correlationPrefix = 'reactivation-' + key + '-' + compShort + '-';

  const reactivationLogs = await prisma.callLog.findMany({
    where: { companyId, direction: 'OUTBOUND', correlationId: { startsWith: 'reactivation-' } },
    select: { leadId: true, correlationId: true, lead: { select: { phone: true } } }
  });

  const failedCalls = await prisma.callLog.findMany({
    where: { companyId, direction: 'OUTBOUND', OR: [{status: 'FAILED'}, {status: 'MISSED'}], NOT: { correlationId: { startsWith: 'reactivation-' } } },
    include: { lead: true }
  });

  let q1Leads = [];
  for (const call of failedCalls) {
      const leadPhone = call.lead?.phone;
      if (!leadPhone) continue;
      q1Leads.push({ id: call.leadId || 'manual-'+leadPhone, phone: leadPhone });
  }

  let matches = 0;
  for (const lead of q1Leads) {
      const leadLogs = reactivationLogs.filter(l => l.leadId === lead.id || (l.lead?.phone && l.lead.phone === lead.phone));
      const q2Log = leadLogs.find(l => l.correlationId?.startsWith(correlationPrefix) && l.correlationId?.endsWith('-q2'));
      if (q2Log) matches++;
  }
  console.log('Strict Q2 matches:', matches);
}
run();

