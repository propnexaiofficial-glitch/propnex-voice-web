const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Wiping database...');
  await prisma.user.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.companyMember.deleteMany({});
  await prisma.pendingApproval.deleteMany({});
  // Add other models if necessary, but these are the main ones preventing signup/login
  console.log('Database wiped successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
