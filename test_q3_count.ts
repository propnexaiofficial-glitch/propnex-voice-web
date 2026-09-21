
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const companyId = '6a8bed4d3f5b7c2eea48418e';
  const key = '2026-09-19';
  const compShort = companyId.replace(/-/g, '').slice(0, 8);
  const correlationPrefix = 'reactivation-' + key + '-' + compShort + '-';
  const b = { q2Time: new Date('2026-09-20T09:30:00Z') }; // 3 PM IST is 9:30 AM UTC
  const nowMs = Date.now();
  const isMissed = (time: Date) => nowMs > time.getTime() + 1 * 60 * 60 * 1000;

  const reactivationLogs = await prisma.callLog.findMany({
    where: { companyId, direction: 'OUTBOUND', correlationId: { startsWith: 'reactivation-' } },
    select: { leadId: true, status: true, correlationId: true, durationSeconds: true, lead: { select: { phone: true } } }
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

  let q3Count = 0;
  for (const lead of q1Leads) {
      const leadLogs = reactivationLogs.filter(l => l.leadId === lead.id || (l.lead?.phone && l.lead.phone === lead.phone));
      const q2Log = leadLogs.find(l => l.correlationId?.startsWith(correlationPrefix) && l.correlationId?.endsWith('-q2'));
      const completedInQ2 = q2Log?.status === 'COMPLETED' && (q2Log.durationSeconds || 0) > 0;
      
      const isPendingInQ2 = (!q2Log && !isMissed(b.q2Time)) || (q2Log && ['PENDING', 'RINGING', 'IN-PROGRESS', 'QUEUED'].includes(q2Log.status?.toUpperCase() || ''));
      const failedInQ2 = !isPendingInQ2 && !completedInQ2;
      
      if (failedInQ2) q3Count++;
  }
  console.log('Q3 leads count:', q3Count);
}
run();

