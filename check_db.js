const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const products = await prisma.product.findMany();
  console.log(products);
}

check().catch(console.error).finally(() => prisma.$disconnect());
