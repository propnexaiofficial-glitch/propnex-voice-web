const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const log = await prisma.callLog.findFirst({
    where: { publicId: 'OUT-1789218166748-3673' }
  });
  console.log(JSON.stringify(log, null, 2));
}
main().catch(console.error);
