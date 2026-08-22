import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const calls = await prisma.callLog.findMany({ where: { companyId: '6a89928d0069674051ad8a64', direction: 'INBOUND' } });
  console.log('MNHFG Calls:', calls.length);
}
main().finally(() => prisma.$disconnect());
