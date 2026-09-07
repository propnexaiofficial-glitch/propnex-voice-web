const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findUnique({
    where: { email: 'satish@schoolknot.com' },
    include: { memberships: true }
  });
  console.log('User:', JSON.stringify(user, null, 2));
  
  if (user && user.memberships.length > 0) {
    const parentCompanyId = user.memberships[0].companyId;
    console.log('User companyId:', parentCompanyId);
    
    const company = await prisma.company.findUnique({
      where: { id: parentCompanyId }
    });
    console.log('Company:', JSON.stringify(company, null, 2));

    const subCompanies = await prisma.company.findMany({
      where: { parentCompanyId }
    });
    console.log('Subcompanies:', JSON.stringify(subCompanies, null, 2));
  } else {
    console.log('No memberships found or user not found');
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
