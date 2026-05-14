-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'MODERATOR', 'ADMIN', 'SERVICE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'LOCKED', 'BANNED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "CharacterStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "GuildRole" AS ENUM ('OWNER', 'OFFICER', 'MEMBER', 'RECRUIT');

-- CreateEnum
CREATE TYPE "FriendStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "MailStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "PartyRole" AS ENUM ('LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "QuestStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'READY_TO_TURN_IN', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ServerKind" AS ENUM ('LOBBY', 'MMORPG', 'DUNGEON', 'MATCHMAKING');

-- CreateEnum
CREATE TYPE "GameServerStatus" AS ENUM ('STARTING', 'ONLINE', 'DRAINING', 'OFFLINE', 'FAILED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('GRANT', 'PURCHASE', 'SALE', 'TRADE', 'QUEST_REWARD', 'LOOT_DROP', 'ADMIN_ADJUSTMENT', 'MARKETPLACE_FEE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'FRIEND', 'GUILD', 'PARTY', 'ECONOMY', 'MAIL', 'MATCHMAKING');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PLAYER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "emailVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "classKey" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" BIGINT NOT NULL DEFAULT 0,
    "status" "CharacterStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentServerSlug" TEXT,
    "currentWorld" TEXT,
    "position" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" UUID NOT NULL,
    "characterId" UUID NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 54,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventorySlot" (
    "id" UUID NOT NULL,
    "inventoryId" UUID NOT NULL,
    "slot" INTEGER NOT NULL,
    "itemKey" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "durability" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventorySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "description" TEXT,
    "bankBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildMember" (
    "id" UUID NOT NULL,
    "guildId" UUID NOT NULL,
    "characterId" UUID NOT NULL,
    "role" "GuildRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Party" (
    "id" UUID NOT NULL,
    "leaderCharacterId" UUID NOT NULL,
    "maxSize" INTEGER NOT NULL DEFAULT 5,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "disbandedAt" TIMESTAMP(3),

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyMember" (
    "id" UUID NOT NULL,
    "partyId" UUID NOT NULL,
    "characterId" UUID NOT NULL,
    "role" "PartyRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestProgress" (
    "id" UUID NOT NULL,
    "characterId" UUID NOT NULL,
    "questKey" TEXT NOT NULL,
    "status" "QuestStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" JSONB NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillProgress" (
    "id" UUID NOT NULL,
    "characterId" UUID NOT NULL,
    "skillKey" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" BIGINT NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameServer" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "ServerKind" NOT NULL,
    "status" "GameServerStatus" NOT NULL DEFAULT 'STARTING',
    "address" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 25565,
    "onlinePlayers" INTEGER NOT NULL DEFAULT 0,
    "maxPlayers" INTEGER NOT NULL DEFAULT 150,
    "metadata" JSONB,
    "lastHeartbeatAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GameServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EconomyTransaction" (
    "id" UUID NOT NULL,
    "characterId" UUID NOT NULL,
    "actorUserId" UUID,
    "type" "TransactionType" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gold',
    "amount" DECIMAL(18,2) NOT NULL,
    "balanceAfter" DECIMAL(18,2),
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EconomyTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceListing" (
    "id" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "itemKey" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gold',
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3),
    "soldAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mail" (
    "id" UUID NOT NULL,
    "senderUserId" UUID,
    "recipientUserId" UUID NOT NULL,
    "recipientCharacterId" UUID,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "attachments" JSONB,
    "status" "MailStatus" NOT NULL DEFAULT 'UNREAD',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Mail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" UUID NOT NULL,
    "requesterId" UUID NOT NULL,
    "addresseeId" UUID NOT NULL,
    "status" "FriendStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerStatistics" (
    "id" UUID NOT NULL,
    "characterId" UUID NOT NULL,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "deaths" INTEGER NOT NULL DEFAULT 0,
    "dungeonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "questsCompleted" INTEGER NOT NULL DEFAULT 0,
    "playtimeSeconds" BIGINT NOT NULL DEFAULT 0,
    "damageDealt" BIGINT NOT NULL DEFAULT 0,
    "damageTaken" BIGINT NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" UUID NOT NULL,
    "characterId" UUID NOT NULL,
    "scope" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "score" DECIMAL(24,4) NOT NULL,
    "rank" INTEGER NOT NULL,
    "metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchmakingTicket" (
    "id" UUID NOT NULL,
    "characterId" UUID NOT NULL,
    "partyId" UUID,
    "queueKey" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 1000,
    "metadata" JSONB,
    "matchedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchmakingTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorUserId" UUID,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "ipAddress" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshTokenHash_key" ON "Session"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_revokedAt_idx" ON "Session"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Character_name_key" ON "Character"("name");

-- CreateIndex
CREATE INDEX "Character_userId_status_idx" ON "Character"("userId", "status");

-- CreateIndex
CREATE INDEX "Character_currentServerSlug_idx" ON "Character"("currentServerSlug");

-- CreateIndex
CREATE INDEX "Character_level_idx" ON "Character"("level");

-- CreateIndex
CREATE INDEX "Character_deletedAt_idx" ON "Character"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_characterId_key" ON "Inventory"("characterId");

-- CreateIndex
CREATE INDEX "Inventory_characterId_idx" ON "Inventory"("characterId");

-- CreateIndex
CREATE INDEX "InventorySlot_itemKey_idx" ON "InventorySlot"("itemKey");

-- CreateIndex
CREATE UNIQUE INDEX "InventorySlot_inventoryId_slot_key" ON "InventorySlot"("inventoryId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_name_key" ON "Guild"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_tag_key" ON "Guild"("tag");

-- CreateIndex
CREATE INDEX "Guild_ownerId_idx" ON "Guild"("ownerId");

-- CreateIndex
CREATE INDEX "Guild_deletedAt_idx" ON "Guild"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GuildMember_characterId_key" ON "GuildMember"("characterId");

-- CreateIndex
CREATE INDEX "GuildMember_guildId_role_idx" ON "GuildMember"("guildId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "GuildMember_guildId_characterId_key" ON "GuildMember"("guildId", "characterId");

-- CreateIndex
CREATE INDEX "Party_leaderCharacterId_idx" ON "Party"("leaderCharacterId");

-- CreateIndex
CREATE INDEX "Party_disbandedAt_idx" ON "Party"("disbandedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PartyMember_characterId_key" ON "PartyMember"("characterId");

-- CreateIndex
CREATE INDEX "PartyMember_partyId_role_idx" ON "PartyMember"("partyId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "PartyMember_partyId_characterId_key" ON "PartyMember"("partyId", "characterId");

-- CreateIndex
CREATE INDEX "QuestProgress_questKey_status_idx" ON "QuestProgress"("questKey", "status");

-- CreateIndex
CREATE UNIQUE INDEX "QuestProgress_characterId_questKey_key" ON "QuestProgress"("characterId", "questKey");

-- CreateIndex
CREATE INDEX "SkillProgress_skillKey_level_idx" ON "SkillProgress"("skillKey", "level");

-- CreateIndex
CREATE UNIQUE INDEX "SkillProgress_characterId_skillKey_key" ON "SkillProgress"("characterId", "skillKey");

-- CreateIndex
CREATE UNIQUE INDEX "GameServer_slug_key" ON "GameServer"("slug");

-- CreateIndex
CREATE INDEX "GameServer_kind_status_idx" ON "GameServer"("kind", "status");

-- CreateIndex
CREATE INDEX "GameServer_lastHeartbeatAt_idx" ON "GameServer"("lastHeartbeatAt");

-- CreateIndex
CREATE INDEX "GameServer_deletedAt_idx" ON "GameServer"("deletedAt");

-- CreateIndex
CREATE INDEX "EconomyTransaction_characterId_createdAt_idx" ON "EconomyTransaction"("characterId", "createdAt");

-- CreateIndex
CREATE INDEX "EconomyTransaction_actorUserId_idx" ON "EconomyTransaction"("actorUserId");

-- CreateIndex
CREATE INDEX "EconomyTransaction_type_createdAt_idx" ON "EconomyTransaction"("type", "createdAt");

-- CreateIndex
CREATE INDEX "MarketplaceListing_itemKey_soldAt_cancelledAt_idx" ON "MarketplaceListing"("itemKey", "soldAt", "cancelledAt");

-- CreateIndex
CREATE INDEX "MarketplaceListing_sellerId_createdAt_idx" ON "MarketplaceListing"("sellerId", "createdAt");

-- CreateIndex
CREATE INDEX "MarketplaceListing_expiresAt_idx" ON "MarketplaceListing"("expiresAt");

-- CreateIndex
CREATE INDEX "Mail_recipientUserId_status_idx" ON "Mail"("recipientUserId", "status");

-- CreateIndex
CREATE INDEX "Mail_senderUserId_idx" ON "Mail"("senderUserId");

-- CreateIndex
CREATE INDEX "Mail_deletedAt_idx" ON "Mail"("deletedAt");

-- CreateIndex
CREATE INDEX "Friendship_addresseeId_status_idx" ON "Friendship"("addresseeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_requesterId_addresseeId_key" ON "Friendship"("requesterId", "addresseeId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStatistics_characterId_key" ON "PlayerStatistics"("characterId");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_scope_season_metric_rank_idx" ON "LeaderboardEntry"("scope", "season", "metric", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_scope_season_metric_characterId_key" ON "LeaderboardEntry"("scope", "season", "metric", "characterId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_type_createdAt_idx" ON "Notification"("type", "createdAt");

-- CreateIndex
CREATE INDEX "MatchmakingTicket_queueKey_matchedAt_cancelledAt_createdAt_idx" ON "MatchmakingTicket"("queueKey", "matchedAt", "cancelledAt", "createdAt");

-- CreateIndex
CREATE INDEX "MatchmakingTicket_characterId_cancelledAt_idx" ON "MatchmakingTicket"("characterId", "cancelledAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventorySlot" ADD CONSTRAINT "InventorySlot_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guild" ADD CONSTRAINT "Guild_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyMember" ADD CONSTRAINT "PartyMember_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyMember" ADD CONSTRAINT "PartyMember_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestProgress" ADD CONSTRAINT "QuestProgress_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillProgress" ADD CONSTRAINT "SkillProgress_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EconomyTransaction" ADD CONSTRAINT "EconomyTransaction_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mail" ADD CONSTRAINT "Mail_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mail" ADD CONSTRAINT "Mail_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStatistics" ADD CONSTRAINT "PlayerStatistics_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchmakingTicket" ADD CONSTRAINT "MatchmakingTicket_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchmakingTicket" ADD CONSTRAINT "MatchmakingTicket_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
