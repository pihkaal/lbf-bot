import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import { pingCommand } from "./ping";
import { trackCommand } from "./track";
import { tejtrackCommand } from "./tejtrack";
import { iconeCommand } from "./icone";
import { gemmesCommand } from "./gemmes";
import { resultCommand } from "./result";

export type Command = (
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  args: Array<string>,
) => Promise<void> | void;

export const commands: Record<string, Command> = {
  ping: pingCommand,
  track: trackCommand,
  tejtrack: tejtrackCommand,
  icone: iconeCommand,
  gemmes: gemmesCommand,
  result: resultCommand,
};
