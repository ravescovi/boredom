-- AlterTable
ALTER TABLE "Game" ADD COLUMN "inputHash" TEXT;

-- CreateIndex
CREATE INDEX "Game_inputHash_idx" ON "Game"("inputHash");
