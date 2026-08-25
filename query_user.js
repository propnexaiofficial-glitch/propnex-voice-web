const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.user.findFirst({ 
    where: { email: 'farhanthehero13@gmail.com' }, 
    include: { memberships: { include: { company: true } } } 
  }); 
  console.log(JSON.stringify(u, null, 2)); 
}
main().catch(console.error).finally(() => prisma.$disconnect());
