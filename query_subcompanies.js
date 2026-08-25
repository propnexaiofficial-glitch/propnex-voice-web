const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.company.findMany({ where: { parentCompanyId: "6a8bed4d3f5b7c2eea48418e" } });
  console.log("Subcompanies:", c.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
