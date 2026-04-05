-- CreateTable
CREATE TABLE "favorited_combination" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "combinationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorited_combination_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorited_combination_userId_idx" ON "favorited_combination"("userId");

-- CreateIndex
CREATE INDEX "favorited_combination_combinationId_idx" ON "favorited_combination"("combinationId");

-- CreateIndex
CREATE UNIQUE INDEX "favorited_combination_userId_combinationId_key" ON "favorited_combination"("userId", "combinationId");

-- AddForeignKey
ALTER TABLE "favorited_combination" ADD CONSTRAINT "favorited_combination_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorited_combination" ADD CONSTRAINT "favorited_combination_combinationId_fkey" FOREIGN KEY ("combinationId") REFERENCES "saved_combination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
