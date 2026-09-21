
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const calls = await prisma.callLog.findMany({
    where: { companyId: '6a8bed4d3f5b7c2eea48418e', direction: 'OUTBOUND', correlationId: { endsWith: '-q2' } },
    select: { status: true }
  });
  console.log('Q2 Calls Statuses:');
  const counts: Record<string, number> = {};
  for (const c of calls) {
      counts[c.status] = (counts[c.status] || 0) + 1;
  }
  console.log(counts);
}
run();

