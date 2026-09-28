const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const d = await prisma.whiteLabelDomain.findUnique({where: {domain: 'jinni360.com'}});
  console.log(JSON.stringify(d, null, 2));
}
main().finally(() => prisma.$disconnect());
