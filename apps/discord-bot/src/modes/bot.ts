import type { Client } from "discord.js";
import { createLogger, logger } from "@lbf-bot/utils";
import { env } from "~/env";
import {
  listTrackedPlayers,
  getTrackedPlayerUsernames,
  addUsernameToHistory,
} from "~/services/tracking";
import { checkForNewQuest, getPlayer } from "~/services/wov";
import { createInfoEmbed } from "~/utils/discord";
import { askForGrinders } from "~/utils/quest";
import { commands } from "~/commands";

const questsLogger = createLogger({ prefix: "quests" });
const trackingLogger = createLogger({ prefix: "tracking" });

const questCheckCron = async (client: Client) => {
  questsLogger.info("Checking for new quest");
  const quest = await checkForNewQuest();
  if (quest) {
    questsLogger.info(`New quest found: '${quest.quest.id}'`);
    await askForGrinders(quest, client);
  } else {
    questsLogger.info("No new quest found");
  }
};

const trackingCron = async (client: Client) => {
  trackingLogger.info("Checking for tracked players");
  const trackedPlayers = await listTrackedPlayers();
  trackingLogger.info(`${trackedPlayers.length} players to check`);
  for (const playerId of trackedPlayers) {
    const player = await getPlayer(playerId);
    if (!player) continue;

    const usernames = await getTrackedPlayerUsernames(playerId);
    if (usernames.includes(player.username)) continue;

    await addUsernameToHistory(playerId, player.username);

    const chan = client.channels.cache.get(env.DISCORD_TRACKING_CHANNEL);
    if (!chan?.isSendable()) {
      return logger.fatal("Invalid 'DISCORD_TRACKING_CHANNEL'");
    }
    const lastUsername = usernames[usernames.length - 1];

    await chan.send(
      createInfoEmbed(
        `### [UPDATE] \`${lastUsername}\` -> \`${player.username}\` [\`${playerId}\`]\n\n**Nouveau pseudo:** \`${player.username}\`\n**Anciens pseudos:**\n${usernames.map((x) => `- \`${x}\``).join("\n")}`,
        0x00ea00,
      ),
    );

    trackingLogger.info(
      `Username changed: ${lastUsername} -> ${player.username} [${playerId}]`,
    );
  }
};

export const setupBotMode = (client: Client) => {
  client.on("clientReady", async (client) => {
    logger.info(`Client ready`);
    logger.info(`Connected as @${client.user.username}`);

    await questCheckCron(client);
    setInterval(() => questCheckCron(client), env.WOV_FETCH_INTERVAL);

    await trackingCron(client);
    setInterval(() => trackingCron(client), env.WOV_TRACKING_INTERVAL);
  });

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith(`<@${client.user!.id}>`)) {
      const [command, ...args] = message.content
        .replace(`<@${client.user!.id}>`, "")
        .trim()
        .split(" ");

      const commandHandler = commands[command];
      if (commandHandler) {
        const child = logger.child(
          `cmd:${command}${args.length > 0 ? " " : ""}${args.join(" ")}`,
        );
        try {
          const start = Date.now();
          await commandHandler(message, args);
          const end = Date.now();
          child.info(`Done in ${(end - start).toFixed(2)}ms`);
        } catch (error: unknown) {
          child.error("Failed:", error);
        }
      }
    }
  });
};
