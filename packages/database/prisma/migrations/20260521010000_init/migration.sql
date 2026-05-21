-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "GameVisibility" AS ENUM ('PRIVATE', 'UNLISTED', 'PUBLIC');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('STARTED', 'CLARIFICATION_REQUESTED', 'COMPLETED', 'REJECTED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "ownerId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "visibility" "GameVisibility" NOT NULL DEFAULT 'PUBLIC',
    "currentJson" JSONB NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "isClassic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameVersion" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "specJson" JSONB NOT NULL,
    "markdownSnapshot" TEXT,
    "promptVersion" TEXT NOT NULL,
    "safetyPolicyVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameRemix" (
    "id" TEXT NOT NULL,
    "sourceGameId" TEXT NOT NULL,
    "remixedGameId" TEXT NOT NULL,
    "remixedByUserId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameRemix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameComponentDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "schemaJson" JSONB NOT NULL,
    "safetyReviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameComponentDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT,
    "status" "GenerationStatus" NOT NULL,
    "inputJson" JSONB NOT NULL,
    "outputJson" JSONB,
    "rejectionReasons" TEXT[],
    "promptVersion" TEXT NOT NULL,
    "safetyPolicyVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Game_shortId_key" ON "Game"("shortId");

-- CreateIndex
CREATE INDEX "Game_score_idx" ON "Game"("score");

-- CreateIndex
CREATE INDEX "Game_isClassic_idx" ON "Game"("isClassic");

-- CreateIndex
CREATE UNIQUE INDEX "GameVersion_gameId_versionNumber_key" ON "GameVersion"("gameId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "GameComponentDefinition_key_key" ON "GameComponentDefinition"("key");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameVersion" ADD CONSTRAINT "GameVersion_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRemix" ADD CONSTRAINT "GameRemix_sourceGameId_fkey" FOREIGN KEY ("sourceGameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRemix" ADD CONSTRAINT "GameRemix_remixedGameId_fkey" FOREIGN KEY ("remixedGameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRemix" ADD CONSTRAINT "GameRemix_remixedByUserId_fkey" FOREIGN KEY ("remixedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationEvent" ADD CONSTRAINT "GenerationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationEvent" ADD CONSTRAINT "GenerationEvent_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

