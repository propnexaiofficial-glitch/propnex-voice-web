const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Updating Bonvoice outbound calls...");
  const outTx = await prisma.creditUsage.findMany({
    where: { description: { startsWith: 'Bonvoice outbound call' } }
  });
  
  let count = 0;
  for (const t of outTx) {
    if (t.description) {
        await prisma.creditUsage.update({
        where: { id: t.id },
        data: { description: t.description.replace('Bonvoice outbound call', 'Outbound call') }
        });
        count++;
    }
  }
  console.log(`Updated ${count} outbound creditUsage logs.`);

  console.log("Updating Bonvoice inbound calls...");
  const inTx = await prisma.creditUsage.findMany({
    where: { description: { startsWith: 'Bonvoice inbound call' } }
  });
  
  let inCount = 0;
  for (const t of inTx) {
    if (t.description) {
        await prisma.creditUsage.update({
        where: { id: t.id },
        data: { description: t.description.replace('Bonvoice inbound call', 'Inbound call') }
        });
        inCount++;
    }
  }
  console.log(`Updated ${inCount} inbound creditUsage logs.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
