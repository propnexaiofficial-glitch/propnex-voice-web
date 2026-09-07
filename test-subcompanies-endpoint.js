const axios = require('axios');

async function test() {
  try {
    // 1. Get the list of all users and their companies from DB
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const users = await prisma.user.findMany({ include: { memberships: true } });
    
    // Find the user for 'Propnex AI' or just the first user
    console.log(`Found ${users.length} users in DB.`);
    
    // We will simulate the auth logic inside the backend by just running the Prisma query the backend runs
    const parentCompanyId = users[0].memberships[0].companyId;
    console.log(`Testing with parentCompanyId: ${parentCompanyId}`);
    
    const subCompanies = await prisma.company.findMany({
      where: { parentCompanyId },
      orderBy: { createdAt: "desc" },
      include: {
        creditBalance: true,
        phoneNumbers: true,
        callLogs: {
          where: { direction: "INBOUND" },
        },
        _count: {
          select: { callLogs: true }
        }
      }
    });

    console.log(`Found ${subCompanies.length} subcompanies for this parent.`);
    if (subCompanies.length > 0) {
      console.log("Sample subcompany mapping:");
      const c = subCompanies[0];
      const allNumbers = (c.phoneNumbers || []).map((p) => p.number).filter(Boolean);
      const mapped = {
        _id: c.id,
        companyName: c.name,
        companyEmail: "", 
        contactPhone: allNumbers[0] || "",
        assignedNumbers: allNumbers,
        status: c.status.toLowerCase(),
        createdAt: c.createdAt.toISOString(),
        creditsUsed: c.creditBalance?.creditsUsed || 0,
        creditsRemaining: c.creditBalance?.creditsRemaining || 0,
        inboundCalls: c.callLogs?.length || 0,
        outboundCalls: (c._count?.callLogs || 0) - (c.callLogs?.length || 0)
      };
      console.log(JSON.stringify(mapped, null, 2));
    }
    
    await prisma.$disconnect();
  } catch(e) {
    console.error(e);
  }
}
test();
