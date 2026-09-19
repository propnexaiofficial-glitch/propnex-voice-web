const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const result = await prisma.callLog.findMany({
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
        }
      },
      take: 1
    });
    console.log(result.length > 0 ? "SUCCESS" : "NO RESULTS");
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
