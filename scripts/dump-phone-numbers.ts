import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const numbers = await prisma.phoneNumber.findMany();
  console.log('All Numbers:', JSON.stringify(numbers, null, 2));
}
main().finally(() => prisma.$disconnect());
