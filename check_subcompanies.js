const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({ include: { memberships: true } });
  console.log('Users:', JSON.stringify(users, null, 2));
  
  const companies = await prisma.company.findMany();
  console.log('Companies:', JSON.stringify(companies, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
