
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const companyId = '6a8bed4d3f5b7c2eea48418e';
    const failedCalls = await prisma.callLog.findMany({
      where: {
        companyId,
        direction: 'OUTBOUND',
        AND: [
          {
            OR: [
              { status: { in: ['FAILED', 'MISSED', 'BUSY', 'NO_ANSWER', 'CANCELLED'] } },
              { durationSeconds: 0 },
            ]
          },
          {
            OR: [
              { correlationId: { isSet: false } },
              { correlationId: null },
              { correlationId: { not: { startsWith: 'reactivation-' } } }
            ]
          }
        ]
      }
    });
    console.log('Prisma found:', failedCalls.length);
  } finally {
    await prisma.();
  }
}
run();

