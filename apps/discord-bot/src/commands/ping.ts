import type { Command } from "~/commands";

export const pingCommand: Command = async (message, args) => {
  await message.reply({
    content: "🫵 Pong",
    options: {
      allowedMentions: {
        repliedUser: false,
      },
    },
  });
};
