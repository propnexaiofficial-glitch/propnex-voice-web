import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const c1 = await prisma.company.findUnique({where: {id: '6a89928d0069674051ad8a64'}}); 
  const c2 = await prisma.company.findUnique({where: {id: '6a8999720b10abacbcbf3bd7'}}); 
  console.log('c1:', c1?.name, 'parent:', c1?.parentCompanyId); 
  console.log('c2:', c2?.name, 'parent:', c2?.parentCompanyId); 
} 
main().finally(() => prisma.$disconnect());
