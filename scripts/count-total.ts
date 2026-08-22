import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const calls = await prisma.callLog.findMany({ 
    where: { 
      companyId: { in: ['6a89928d0069674051ad8a64', '6a8999720b10abacbcbf3bd7'] }, 
      direction: 'INBOUND' 
    } 
  }); 
  console.log('Total:', calls.length); 
  console.log(JSON.stringify(calls.map(c => c.callLogId), null, 2)); 
} 
main().finally(() => prisma.$disconnect());
