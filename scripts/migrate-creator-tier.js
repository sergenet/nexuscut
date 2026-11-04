const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const migrationName = '20260814_creator_pro_tiers';

async function main() {
  // Keep a tiny migration ledger in SQLite. The migration is deliberately
  // idempotent: it changes only the former $12 "pro" records once, before
  // the new $29 Pro tier can create records with that name.
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS NexusCutMigration (
      name TEXT PRIMARY KEY,
      appliedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const applied = await prisma.$queryRawUnsafe(
    'SELECT name FROM NexusCutMigration WHERE name = ?',
    migrationName,
  );

  if (applied.length) {
    console.log('Creator/Pro legacy migration already applied.');
    return;
  }

  const result = await prisma.user.updateMany({
    where: { isPro: true, planTier: 'pro' },
    data: { planTier: 'creator' },
  });

  await prisma.$executeRawUnsafe(
    'INSERT INTO NexusCutMigration (name) VALUES (?)',
    migrationName,
  );
  console.log(`Moved ${result.count} legacy paid account(s) to Creator.`);
}

main()
  .catch((error) => {
    console.error('Creator/Pro legacy migration failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
