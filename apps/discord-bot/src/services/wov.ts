import { env } from "~/env";
import { redis } from "@lbf-bot/database";
import type { QuestResult } from "~/types";

export const getLatestQuest = async (): Promise<QuestResult> => {
  const response = await fetch(
    `https://api.wolvesville.com/clans/${env.WOV_CLAN_ID}/quests/history`,
    {
      method: "GET",
      headers: { Authorization: `Bot ${env.WOV_API_KEY}` },
    },
  );
  const history = (await response.json()) as Array<QuestResult>;
  return history[0];
};

export const checkForNewQuest = async (): Promise<QuestResult | null> => {
  const lastQuest = await getLatestQuest();
  const lastId = lastQuest.quest.id;

  const cachedQuestId = await redis.get("quest:last_id");
  if (cachedQuestId === lastId || cachedQuestId === "IGNORE") {
    return null;
  }

  await redis.set("quest:last_id", lastId);
  return lastQuest;
};

export const getClanMembers = async (): Promise<
  Array<{ playerId: string; username: string }>
> => {
  const cached = await redis.get("clan:members");
  if (cached) {
    return JSON.parse(cached);
  }

  const response = await fetch(
    `https://api.wolvesville.com/clans/${env.WOV_CLAN_ID}/members`,
    {
      method: "GET",
      headers: { Authorization: `Bot ${env.WOV_API_KEY}` },
    },
  );
  const data = (await response.json()) as Array<{
    playerId: string;
    username: string;
  }>;

  await redis.set("clan:members", JSON.stringify(data), "EX", 60 * 60);
  return data;
};

export const searchPlayer = async (username: string) => {
  try {
    const response = await fetch(
      `https://api.wolvesville.com//players/search?username=${username}`,
      {
        method: "GET",
        headers: { Authorization: `Bot ${env.WOV_API_KEY}` },
      },
    );

    if (response.status === 404) return null;

    const data = (await response.json()) as {
      id: string;
      clanId: string | null;
    };

    return data;
  } catch {
    return null;
  }
};

export const getClanInfos = async (clanId: string) => {
  const response = await fetch(
    `https://api.wolvesville.com/clans/${clanId}/info`,
    {
      method: "GET",
      headers: { Authorization: `Bot ${env.WOV_API_KEY}` },
    },
  );
  const data = (await response.json()) as {
    name: string;
    tag: string;
  };

  return data;
};

export async function getPlayer(playerId: string) {
  try {
    const response = await fetch(
      `https://api.wolvesville.com/players/${playerId}`,
      {
        method: "GET",
        headers: { Authorization: `Bot ${env.WOV_API_KEY}` },
      },
    );

    if (response.status === 404) return null;

    const data = (await response.json()) as {
      username: string;
    };

    return data;
  } catch {
    return null;
  }
}
