import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Searching for stuck calls from +918309723030...");

  const stuckCalls = await prisma.callLog.findMany({
    where: {
      status: "RINGING"
    },
    include: {
      lead: true
    }
  });

  console.log("Found stuck calls:", stuckCalls.length);

  for (const call of stuckCalls) {
    console.log(`Call ID: ${call.id}, Status: ${call.status}, Started: ${call.startedAt}`);
    
    // Update it to FAILED
    await prisma.callLog.update({
      where: { id: call.id },
      data: { status: "FAILED" }
    });
    console.log(`Updated Call ID ${call.id} to FAILED.`);
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
