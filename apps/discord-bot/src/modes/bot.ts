import type { Client } from "discord.js";
import { env } from "~/env";
import { listTrackedPlayers, trackWovPlayer } from "~/services/tracking";
import { checkForNewQuest } from "~/services/wov";
import { createInfoEmbed } from "~/utils/discord";
import { askForGrinders } from "~/utils/quest";
import { commands } from "~/commands";

const questCheckCron = async (client: Client) => {
  const quest = await checkForNewQuest();
  if (quest) {
    await askForGrinders(quest, client);
  }
};

const trackingCron = async (client: Client) => {
  const trackedPlayers = await listTrackedPlayers();
  for (const playerId of trackedPlayers) {
    const res = await trackWovPlayer(playerId);
    if (res.event !== "changed") return;

    const chan = client.channels.cache.get(env.DISCORD_TRACKING_CHANNEL);
    if (!chan?.isSendable()) throw "Invalid tracking channel";

    const lastUsername = res.oldUsernames[res.oldUsernames.length - 1];

    await chan.send(
      createInfoEmbed(
        `### [UPDATE] \`${lastUsername}\` -> \`${res.newUsername}\` [\`${playerId}\`]\n\n**Nouveau pseudo:** \`${res.newUsername}\`\n**Anciens pseudos:**\n${res.oldUsernames.map((x) => `- \`${x}\``).join("\n")}`,
      ),
    );
  }
};

export const setupBotMode = (client: Client) => {
  client.on("clientReady", async (client) => {
    console.log(`Logged in as ${client.user.username}`);

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
        await commandHandler(message, args);
      }
    }
  });
};
