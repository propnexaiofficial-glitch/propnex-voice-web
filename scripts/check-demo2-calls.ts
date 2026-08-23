import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const demo2 = await prisma.company.findFirst({ where: { name: "Demo2" } });
  if (!demo2) return console.log("Demo2 not found");
  
  const calls = await prisma.callLog.findMany({
    where: { companyId: demo2.id },
    orderBy: { createdAt: "desc" },
    take: 5
  });
  console.log("Demo2 calls:", JSON.stringify(calls, null, 2));

  // Try finding via the DemoTest5 parent too
  const allCalls = await prisma.callLog.findMany({
    where: { 
      companyId: demo2.parentCompanyId!,
      // look for anything matching 6581 in providerCallId or logId
    },
    orderBy: { createdAt: "desc" },
    take: 5
  });
  console.log("Latest Parent calls:", JSON.stringify(allCalls, null, 2));
}

main().finally(() => prisma.$disconnect());
