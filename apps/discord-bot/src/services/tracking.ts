import { getPlayer } from "~/services/wov";
import { db, tables, eq } from "@lbf-bot/database";

export async function listTrackedPlayers(): Promise<string[]> {
  const players = await db.query.trackedPlayers.findMany({
    columns: {
      playerId: true,
    },
  });

  return players.map((p) => p.playerId);
}

export async function isWovPlayerTracked(playerId: string): Promise<boolean> {
  const player = await db.query.trackedPlayers.findFirst({
    where: eq(tables.trackedPlayers.playerId, playerId),
  });

  return player !== undefined;
}

export async function untrackWovPlayer(playerId: string): Promise<void> {
  await db
    .delete(tables.trackedPlayers)
    .where(eq(tables.trackedPlayers.playerId, playerId));
}

export async function trackWovPlayer(playerId: string): Promise<void> {
  const alreadyTracked = await isWovPlayerTracked(playerId);
  if (alreadyTracked) return;

  const player = await getPlayer(playerId);
  if (!player) return;

  await db.insert(tables.trackedPlayers).values({
    playerId,
  });

  await db.insert(tables.usernameHistory).values({
    playerId,
    username: player.username,
  });
}

export async function getTrackedPlayerUsernames(
  playerId: string,
): Promise<string[]> {
  const tracked = await db.query.trackedPlayers.findFirst({
    where: eq(tables.trackedPlayers.playerId, playerId),
    with: {
      usernameHistory: {
        orderBy: (history, { asc }) => [asc(history.firstSeenAt)],
      },
    },
  });

  if (!tracked) return [];
  return tracked.usernameHistory.map((h) => h.username);
}

export async function addUsernameToHistory(
  playerId: string,
  username: string,
): Promise<void> {
  await db.insert(tables.usernameHistory).values({
    playerId,
    username,
  });

  await db
    .update(tables.trackedPlayers)
    .set({ updatedAt: new Date() })
    .where(eq(tables.trackedPlayers.playerId, playerId));
}
