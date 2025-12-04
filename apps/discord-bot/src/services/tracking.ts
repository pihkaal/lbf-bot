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

export async function untrackWovPlayer(
  playerId: string,
): Promise<{ event: "notTracked" } | { event: "trackerRemoved" }> {
  const player = await db.query.trackedPlayers.findFirst({
    where: eq(tables.trackedPlayers.playerId, playerId),
  });

  if (!player) return { event: "notTracked" };

  await db
    .delete(tables.trackedPlayers)
    .where(eq(tables.trackedPlayers.playerId, playerId));

  return { event: "trackerRemoved" };
}

export async function trackWovPlayer(playerId: string): Promise<
  | { event: "notFound" }
  | {
      event: "registered";
    }
  | { event: "changed"; oldUsernames: string[]; newUsername: string }
  | { event: "none" }
> {
  const player = await getPlayer(playerId);
  if (!player) return { event: "notFound" };

  const tracked = await db.query.trackedPlayers.findFirst({
    where: eq(tables.trackedPlayers.playerId, playerId),
    with: {
      usernameHistory: {
        orderBy: (history, { asc }) => [asc(history.firstSeenAt)],
      },
    },
  });

  if (tracked) {
    const currentUsernames = tracked.usernameHistory.map((h) => h.username);

    if (!currentUsernames.includes(player.username)) {
      await db.insert(tables.usernameHistory).values({
        playerId,
        username: player.username,
      });

      await db
        .update(tables.trackedPlayers)
        .set({ updatedAt: new Date() })
        .where(eq(tables.trackedPlayers.playerId, playerId));

      return {
        event: "changed",
        oldUsernames: currentUsernames,
        newUsername: player.username,
      };
    } else {
      return {
        event: "none",
      };
    }
  } else {
    await db.insert(tables.trackedPlayers).values({
      playerId,
    });

    await db.insert(tables.usernameHistory).values({
      playerId,
      username: player.username,
    });

    return { event: "registered" };
  }
}
