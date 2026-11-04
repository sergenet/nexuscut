-- Preserve legacy tables while adding the monthly free-export period anchor.
ALTER TABLE "User"
ADD COLUMN "exportPeriodStart" DATETIME;
