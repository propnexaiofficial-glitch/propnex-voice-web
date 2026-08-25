const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const companyId = "6a8bed4d3f5b7c2eea48418e";
  const phoneRecords = await prisma.phoneNumber.findMany({
    where: { 
      OR: [
        { companyId: companyId },
        { company: { parentCompanyId: companyId } }
      ],
      status: "ACTIVE" 
    }
  });
  console.log("ME API QUERY RETURNS:", phoneRecords.map(r => r.number));
}
main().catch(console.error).finally(() => prisma.$disconnect());
