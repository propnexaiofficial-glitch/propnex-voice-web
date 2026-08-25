const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const numbers = await prisma.phoneNumber.findMany({ 
    where: { 
      OR: [ 
        { companyId: '6a8bed4d3f5b7c2eea48418e' }, 
        { assignedParentTenantId: '6a8bed4d3f5b7c2eea48418e' } 
      ] 
    }
  }); 
  console.log(JSON.stringify(numbers, null, 2)); 
}
main().catch(console.error).finally(() => prisma.$disconnect());
