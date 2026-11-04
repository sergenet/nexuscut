-- Additive migration only. It never alters or drops existing NexusCut tables.
CREATE TABLE IF NOT EXISTS "SoroFeedConfig" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "feedUrl" TEXT NOT NULL,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "SoroDraft" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sourceGuid" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT,
  "sourceUrl" TEXT,
  "excerpt" TEXT,
  "contentHtml" TEXT NOT NULL,
  "publishedAt" DATETIME,
  "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft'
);

CREATE UNIQUE INDEX IF NOT EXISTS "SoroDraft_sourceGuid_key" ON "SoroDraft"("sourceGuid");
