import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const allCalls = await prisma.callLog.findMany({ 
    where: { 
      startedAt: { 
        gte: new Date('2026-08-22T17:35:00Z'), 
        lte: new Date('2026-08-22T17:45:00Z') 
      } 
    } 
  }); 
  console.log('Calls:', JSON.stringify(allCalls.map(c => ({ 
    id: c.id, 
    callLogId: c.callLogId, 
    companyId: c.companyId 
  })), null, 2));
}
main().finally(() => prisma.$disconnect());
