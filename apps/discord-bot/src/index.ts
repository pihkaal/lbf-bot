import { env } from "~/env";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { setupBotMode } from "~/modes/bot";
import { setupUserMode } from "~/modes/user";
import { parseArgs } from "~/utils/cli";

const mode = parseArgs(process.argv.slice(2));

console.log(`Mode: ${mode.type}`);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Message, Partials.Channel],
});

switch (mode.type) {
  case "user": {
    setupUserMode(client, mode.channelId);
    break;
  }

  case "bot": {
    setupBotMode(client);
    break;
  }

  default: {
    // @ts-ignore
    console.error(`ERROR: Not implemented: '${mode.type}'`);
    process.exit(1);
  }
}

await client.login(env.DISCORD_BOT_TOKEN);
