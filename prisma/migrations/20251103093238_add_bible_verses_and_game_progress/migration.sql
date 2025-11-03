-- CreateTable
CREATE TABLE "BibleVerse" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category" TEXT,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BibleVerse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerseGameProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verseId" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "successes" INTEGER NOT NULL DEFAULT 0,
    "bestTime" INTEGER,
    "lastPlayedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerseGameProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BibleVerse_reference_key" ON "BibleVerse"("reference");

-- CreateIndex
CREATE INDEX "BibleVerse_popularity_idx" ON "BibleVerse"("popularity");

-- CreateIndex
CREATE INDEX "BibleVerse_category_idx" ON "BibleVerse"("category");

-- CreateIndex
CREATE UNIQUE INDEX "VerseGameProgress_userId_verseId_key" ON "VerseGameProgress"("userId", "verseId");

-- CreateIndex
CREATE INDEX "VerseGameProgress_userId_idx" ON "VerseGameProgress"("userId");

-- CreateIndex
CREATE INDEX "VerseGameProgress_verseId_idx" ON "VerseGameProgress"("verseId");

-- CreateIndex
CREATE INDEX "VerseGameProgress_lastPlayedAt_idx" ON "VerseGameProgress"("lastPlayedAt");

-- AddForeignKey
ALTER TABLE "VerseGameProgress" ADD CONSTRAINT "VerseGameProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerseGameProgress" ADD CONSTRAINT "VerseGameProgress_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "BibleVerse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
