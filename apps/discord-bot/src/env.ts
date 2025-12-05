import { z } from "zod";
import "dotenv/config";
import { logger } from "@lbf-bot/utils";

// TODO: use parseEnv from utils

const schema = z.object({
  DISCORD_BOT_TOKEN: z.string(),
  DISCORD_MENTION: z.string(),
  DISCORD_REWARDS_GIVER: z.string(),
  DISCORD_REWARDS_CHANNEL: z.string(),
  // TODO: remove and compose from staff role id
  DISCORD_ADMIN_MENTION: z.string(),
  // TODO: rename to reward ask channel or smth
  DISCORD_ADMIN_CHANNEL: z.string(),
  DISCORD_TRACKING_CHANNEL: z.string(),
  DISCORD_STAFF_ROLE_ID: z.string(),
  WOV_API_KEY: z.string(),
  WOV_CLAN_ID: z.string(),
  WOV_FETCH_INTERVAL: z.coerce.number(),
  WOV_TRACKING_INTERVAL: z.coerce.number(),
  QUEST_REWARDS: z
    .string()
    .transform((x) => x.split(",").map((x) => x.trim()))
    .optional(),
  QUEST_EXCLUDE: z
    .string()
    .transform((x) => x.split(",").map((x) => x.trim()))
    .optional()
    .default(""),
});

const result = schema.safeParse(process.env);
if (!result.success) {
  logger.fatal(
    `❌ Invalid environments variables:\n${result.error.errors
      .map((x) => `- ${x.path.join(".")}: ${x.message}`)
      .join("\n")}`,
  );
}

export const env = result.data;
