CREATE TABLE IF NOT EXISTS "FoundingTesterApplication" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "creatorType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "visitorId" TEXT,
  "source" TEXT,
  "medium" TEXT,
  "campaign" TEXT,
  "content" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "FoundingTesterApplication_email_key"
ON "FoundingTesterApplication"("email");
