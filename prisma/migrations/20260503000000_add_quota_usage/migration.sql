-- CreateTable
CREATE TABLE "quota_usage" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "units" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quota_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quota_usage_date_key" ON "quota_usage"("date");
