import { getPlayer } from "~/services/wov";
import { readFile, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import type { TrackedPlayers } from "~/types";

const TRACKED_PLAYER_FILE = "./.cache/tracked.json";

export async function initTracking(): Promise<void> {
  try {
    await access(TRACKED_PLAYER_FILE, constants.F_OK);
  } catch {
    await writeFile(TRACKED_PLAYER_FILE, "{}");
  }
}

export async function listTrackedPlayers(): Promise<string[]> {
  const content = await readFile(TRACKED_PLAYER_FILE, "utf-8");
  const trackedPlayers: TrackedPlayers = JSON.parse(content);

  return Object.keys(trackedPlayers);
}

export async function untrackWovPlayer(
  playerId: string,
): Promise<{ event: "notTracked" } | { event: "trackerRemoved" }> {
  const content = await readFile(TRACKED_PLAYER_FILE, "utf-8");
  const trackedPlayers: TrackedPlayers = JSON.parse(content);

  if (!trackedPlayers[playerId]) return { event: "notTracked" };

  delete trackedPlayers[playerId];
  await writeFile(TRACKED_PLAYER_FILE, JSON.stringify(trackedPlayers));

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
  const content = await readFile(TRACKED_PLAYER_FILE, "utf-8");
  const trackedPlayers: TrackedPlayers = JSON.parse(content);

  const player = await getPlayer(playerId);
  if (!player) return { event: "notFound" };

  const currentUsernames = trackedPlayers[playerId];
  if (currentUsernames) {
    const oldUsernames = [...currentUsernames];
    if (!currentUsernames.includes(player.username)) {
      currentUsernames.push(player.username);

      await writeFile(TRACKED_PLAYER_FILE, JSON.stringify(trackedPlayers));

      return {
        event: "changed",
        oldUsernames,
        newUsername: player.username,
      };
    } else {
      return {
        event: "none",
      };
    }
  } else {
    trackedPlayers[playerId] = [player.username];
    await writeFile(TRACKED_PLAYER_FILE, JSON.stringify(trackedPlayers));
    return { event: "registered" };
  }
}
