import type { Client, TextChannel } from "discord.js";
import { ChannelType } from "discord.js";
import * as readline from "node:readline";

export const setupUserMode = (client: Client, channelId: string) => {
  client.on("clientReady", (client) => {
    console.log(`Logged in as ${client.user.username}`);

    const chan = client.channels.cache.get(channelId);
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
      if (line.trim().length > 0) {
        await (chan as TextChannel).send(line);
      }
      rl.prompt();
    });

    rl.on("close", () => {
      process.exit(0);
    });
  });
};
