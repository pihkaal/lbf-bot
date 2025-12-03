import type { Command } from "~/commands";
import { getLatestQuest } from "~/services/wov";
import { askForGrinders } from "~/utils/quest";

export const resultCommand: Command = async (message, args) => {
  const client = message.client;
  const quest = await getLatestQuest();
  await askForGrinders(quest, client);
};
