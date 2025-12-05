import type { Command } from "~/commands";
import { isWovPlayerTracked, untrackWovPlayer } from "~/services/tracking";
import { searchPlayer } from "~/services/wov";
import { replyError, createInfoEmbed, replySuccess } from "~/utils/discord";
import { env } from "~/env";

export const tejtrackCommand: Command = async (message, args) => {
  // check staff permission
  if (!message.member?.roles.cache.has(env.DISCORD_STAFF_ROLE_ID)) {
    await replyError(message, "Tu t'es cru chez mémé ou quoi faut être staff");
    return;
  }

  const playerName = args[0];
  if (!playerName) {
    await replyError(
      message,
      "Usage:`@LBF untrack NOM_JOUEUR`, exemple: `@LBF untrack Yuno`.\n**Attention les majuscules sont importantes**",
    );
    return;
  }

  const player = await searchPlayer(playerName);
  if (!player) {
    await replyError(
      message,
      "Cette personne n'existe pas.\n**Attention les majuscules sont importantes**",
    );
    return;
  }

  if (!(await isWovPlayerTracked(player.id))) {
    await replyError(
      message,
      `Pas de tracker pour \`${playerName}\` [\`${player.id}\`]`,
    );
    return;
  }

  await untrackWovPlayer(player.id);

  await replySuccess(
    message,
    `Tracker enlevé pour \`${playerName}\` [\`${player.id}\`]`,
  );

  const chan = message.client.channels.cache.get(env.DISCORD_TRACKING_CHANNEL);
  if (!chan?.isSendable()) throw "Invalid tracking channel";

  await chan.send(
    createInfoEmbed(
      `### [REMOVED] \`${playerName}\` [\`${player.id}\`]`,
      0xea0000,
    ),
  );
};
