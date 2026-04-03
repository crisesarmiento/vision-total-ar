-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('SYSTEM', 'DARK', 'LIGHT');

-- CreateEnum
CREATE TYPE "GridPreset" AS ENUM ('GRID_1', 'GRID_2X1', 'GRID_2X2', 'GRID_3X3', 'GRID_4X4', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CombinationVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" "ThemePreference" NOT NULL DEFAULT 'SYSTEM',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "tickerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "keyboardShortcutsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "defaultGridPreset" "GridPreset" NOT NULL DEFAULT 'GRID_2X2',
    "defaultLayoutJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_combination" (
    "id" TEXT NOT NULL,
    "publicSlug" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "layoutJson" JSONB NOT NULL,
    "visibility" "CombinationVisibility" NOT NULL DEFAULT 'PRIVATE',
    "favoritesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_combination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_channel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recent_combination" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "combinationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastViewedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recent_combination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "sessionsCount" INTEGER NOT NULL DEFAULT 0,
    "secondsWatched" INTEGER NOT NULL DEFAULT 0,
    "lastWatchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channel_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "user_preference_userId_key" ON "user_preference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_combination_publicSlug_key" ON "saved_combination"("publicSlug");

-- CreateIndex
CREATE INDEX "saved_combination_ownerId_updatedAt_idx" ON "saved_combination"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "saved_combination_visibility_favoritesCount_idx" ON "saved_combination"("visibility", "favoritesCount");

-- CreateIndex
CREATE INDEX "favorite_channel_userId_idx" ON "favorite_channel"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_channel_userId_channelId_key" ON "favorite_channel"("userId", "channelId");

-- CreateIndex
CREATE INDEX "recent_combination_userId_lastViewedAt_idx" ON "recent_combination"("userId", "lastViewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "recent_combination_userId_combinationId_key" ON "recent_combination"("userId", "combinationId");

-- CreateIndex
CREATE INDEX "channel_analytics_userId_sessionsCount_idx" ON "channel_analytics"("userId", "sessionsCount");

-- CreateIndex
CREATE UNIQUE INDEX "channel_analytics_userId_channelId_key" ON "channel_analytics"("userId", "channelId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preference" ADD CONSTRAINT "user_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_combination" ADD CONSTRAINT "saved_combination_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_channel" ADD CONSTRAINT "favorite_channel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recent_combination" ADD CONSTRAINT "recent_combination_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recent_combination" ADD CONSTRAINT "recent_combination_combinationId_fkey" FOREIGN KEY ("combinationId") REFERENCES "saved_combination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_analytics" ADD CONSTRAINT "channel_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
