const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const result = await prisma.callLog.findMany({
      take: 10,
      orderBy: { startedAt: 'desc' },
      select: { id: true, direction: true, status: true, providerCallId: true, phoneNumber: { select: { number: true } }, lead: { select: { phone: true } }, companyId: true, publicId: true, startedAt: true }
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
