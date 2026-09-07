require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'satish@schoolknot.com' } });
    if (!user) return console.log('no user');
    const userId = user.id;
    console.log('userId:', userId);
    
    const member = await prisma.companyMember.findFirst({
      where: { userId, status: 'ACTIVE' }
    });
    console.log('member:', member);
    if (!member) return;
    
    const subCompanies = await prisma.company.findMany({
      where: { parentCompanyId: member.companyId },
      include: { 
        creditBalance: true,
        phoneNumbers: { select: { number: true, direction: true, channels: true } }
      }
    });
    console.log('subCompanies:', subCompanies.length);
    const subCompanyIds = subCompanies.map(c => c.id);
    console.log('subCompanyIds:', subCompanyIds);
    
    if (subCompanyIds.length > 0) {
      const callCounts = await prisma.callLog.groupBy({
        by: ['companyId', 'direction'],
        where: { companyId: { in: subCompanyIds } },
        _count: { _all: true }
      });
      console.log('callCounts:', callCounts);
    }
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
