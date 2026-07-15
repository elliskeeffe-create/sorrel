-- CreateTable
CREATE TABLE "ScratchpadEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScratchpadEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "contextSummary" TEXT,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "confidence" REAL NOT NULL,
    "sourceGmailMessageId" TEXT,
    "sourceThreadId" TEXT,
    "sourceSnippet" TEXT,
    "readyToClose" BOOLEAN NOT NULL DEFAULT false,
    "closeSuggestionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Commitment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Commitment" ("confidence", "counterparty", "createdAt", "description", "direction", "dueDate", "id", "priority", "sourceGmailMessageId", "sourceSnippet", "status", "updatedAt", "userId") SELECT "confidence", "counterparty", "createdAt", "description", "direction", "dueDate", "id", "priority", "sourceGmailMessageId", "sourceSnippet", "status", "updatedAt", "userId" FROM "Commitment";
DROP TABLE "Commitment";
ALTER TABLE "new_Commitment" RENAME TO "Commitment";
CREATE INDEX "Commitment_userId_status_idx" ON "Commitment"("userId", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ScratchpadEntry_userId_key" ON "ScratchpadEntry"("userId");
