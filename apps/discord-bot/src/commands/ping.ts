import type { Command } from "~/commands";

export const pingCommand: Command = async (message, args) => {
  await message.reply("pong");
};
