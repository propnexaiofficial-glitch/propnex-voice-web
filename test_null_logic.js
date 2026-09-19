const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const result = await prisma.callLog.findMany({
      where: {
        NOT: {
          AND: [
            { correlationId: { not: null } },
            { correlationId: { startsWith: 'reactivation-' } },
            {
              OR: [
                { status: { not: 'COMPLETED' } },
                { durationSeconds: 0 }
              ]
            }
          ]
        },
        direction: 'OUTBOUND',
        status: 'FAILED',
        companyId: '6a897a7c500636731c1f15da'
      },
      take: 2,
      orderBy: { startedAt: 'desc' },
      select: { id: true, correlationId: true, status: true }
    });
    console.log("With not:null -> ", result);

    const result2 = await prisma.callLog.findMany({
      where: {
        NOT: {
          AND: [
            { correlationId: { startsWith: 'reactivation-' } },
            {
              OR: [
                { status: { not: 'COMPLETED' } },
                { durationSeconds: 0 }
              ]
            }
          ]
        },
        direction: 'OUTBOUND',
        status: 'FAILED',
        companyId: '6a897a7c500636731c1f15da'
      },
      take: 2,
      orderBy: { startedAt: 'desc' },
      select: { id: true, correlationId: true, status: true }
    });
    console.log("Without not:null -> ", result2);

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
