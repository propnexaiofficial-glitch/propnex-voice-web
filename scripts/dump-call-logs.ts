import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const demmo = await prisma.company.findFirst({ where: { name: "Demmo" } });
  if (!demmo) return console.log("Demmo not found");

  const calls = await prisma.callLog.findMany({
    where: { companyId: demmo.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, callLogId: true, providerCallId: true, startedAt: true, phoneNumberId: true }
  });

  console.log("Demmo Call Logs:");
  console.log(JSON.stringify(calls, null, 2));

  // also parent company calls
  const parentCalls = await prisma.callLog.findMany({
    where: { companyId: demmo.parentCompanyId! },
    orderBy: { createdAt: "desc" },
    select: { id: true, callLogId: true, providerCallId: true, startedAt: true, phoneNumberId: true }
  });
  console.log("\nParent Call Logs:");
  console.log(JSON.stringify(parentCalls.slice(0, 5), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
