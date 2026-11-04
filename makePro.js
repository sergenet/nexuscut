const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.user.update({
    where: { clerkId: 'local-user' },
    data: { isPro: true, exportCount: 0 }
  });
  console.log("Upgraded local-user to Pro!");
}
run();
