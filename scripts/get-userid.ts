import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const member = await prisma.companyMember.findFirst({where: {companyId: '6a89928d0069674051ad8a64'}}); 
  console.log('USER ID:', member?.userId); 
} 
main().finally(() => prisma.$disconnect());
