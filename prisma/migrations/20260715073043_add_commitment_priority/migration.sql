-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Commitment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'QUICK_WIN',
    "counterparty" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "confidence" REAL NOT NULL,
    "sourceGmailMessageId" TEXT NOT NULL,
    "sourceSnippet" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Commitment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Commitment" ("confidence", "counterparty", "createdAt", "description", "direction", "dueDate", "id", "sourceGmailMessageId", "sourceSnippet", "status", "updatedAt", "userId") SELECT "confidence", "counterparty", "createdAt", "description", "direction", "dueDate", "id", "sourceGmailMessageId", "sourceSnippet", "status", "updatedAt", "userId" FROM "Commitment";
DROP TABLE "Commitment";
ALTER TABLE "new_Commitment" RENAME TO "Commitment";
CREATE INDEX "Commitment_userId_status_idx" ON "Commitment"("userId", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
