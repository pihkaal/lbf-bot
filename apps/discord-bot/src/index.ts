import { initAccounts } from "~/services/account";
import { env } from "~/env";
import {
  initTracking,
  listTrackedPlayers,
  trackWovPlayer,
} from "~/services/tracking";
import { checkForNewQuest } from "~/services/wov";
import { createInfoEmbed } from "~/utils/discord";
import { askForGrinders } from "~/utils/quest";
import { commands } from "~/commands";

import { ChannelType, Client, GatewayIntentBits, Partials } from "discord.js";
import * as readline from "node:readline";

// user mode = write in console, send in channel
const flagIndex = process.argv.indexOf("--user");
let userMode: { enabled: true; channelId: string } | { enabled: false } = {
  enabled: false,
};
if (flagIndex !== -1) {
  const channelId = process.argv[flagIndex + 1];
  if (channelId === undefined) {
    console.error("ERROR: --user expects channelId as a paramater");
    process.exit(1);
  }

  userMode = { enabled: true, channelId };
}

console.log(`User mode: ${userMode.enabled ? "enabled" : "disabled"}`);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Message, Partials.Channel],
});

const questCheckCron = async () => {
  const quest = await checkForNewQuest();
  if (quest) {
    await askForGrinders(quest, client);
  }
};

const trackingCron = async () => {
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

client.on("ready", async (client) => {
  console.log(`Logged in as ${client.user.username}`);

  if (userMode.enabled) {
    const chan = client.channels.cache.get(userMode.channelId);
    if (chan?.type !== ChannelType.GuildText) {
      console.error("ERROR: invalid channel");
      process.exit(1);
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `${chan.name} ~ `,
    });

    rl.prompt();

    rl.on("line", async (line) => {
      await chan.send(line);
      rl.prompt();
    });

    rl.on("close", () => {
      process.exit(0);
    });
  } else {
    await initAccounts();
    await initTracking();

    await questCheckCron();
    setInterval(questCheckCron, env.WOV_FETCH_INTERVAL);

    await trackingCron();
    setInterval(trackingCron, env.WOV_TRACKING_INTERVAL);
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || userMode.enabled) return;

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

await client.login(env.DISCORD_BOT_TOKEN);
