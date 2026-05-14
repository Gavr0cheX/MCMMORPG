export const serverKinds = ["LOBBY", "MMORPG", "DUNGEON", "MATCHMAKING"] as const;

export const defaultClassKeys = ["guardian", "ranger", "arcanist", "mender", "duelist"] as const;

export const redisKeyspace = {
  onlinePlayer: (playerId: string) => `online:${playerId}`,
  serverPlayers: (serverSlug: string) => `server:${serverSlug}:players`,
  partyState: (partyId: string) => `party:${partyId}:state`,
  guildState: (guildId: string) => `guild:${guildId}:state`,
  matchmakingQueue: (queueKey: string) => `matchmaking:${queueKey}`
};
