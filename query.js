const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const numbers = await prisma.phoneNumber.findMany({
    select: { number: true, companyId: true, assignedParentTenantId: true }
  });
  console.log(JSON.stringify(numbers, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
