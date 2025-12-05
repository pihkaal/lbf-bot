import type { Command } from "~/commands";
import { trackWovPlayer, isWovPlayerTracked } from "~/services/tracking";
import { searchPlayer } from "~/services/wov";
import { replyError, createInfoEmbed, replySuccess } from "~/utils/discord";
import { env } from "~/env";

export const trackCommand: Command = async (message, args) => {
  // check staff permission
  if (!message.member?.roles.cache.has(env.DISCORD_STAFF_ROLE_ID)) {
    await replyError(message, "Tu t'es cru chez mémé ou quoi faut être staff");
    return;
  }

  const playerName = args[0];
  if (!playerName) {
    await replyError(
      message,
      "Usage:`@LBF track NOM_JOUEUR`, exemple: `@LBF track Yuno`.\n**Attention les majuscules sont importantes**",
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

  const alreadyTracked = await isWovPlayerTracked(player.id);
  if (alreadyTracked) {
    await replyError(
      message,
      `Tracker déjà enregistré pour \`${playerName}\` [\`${player.id}\`]`,
    );
    return;
  }

  await trackWovPlayer(player.id);

  await replySuccess(
    message,
    `Tracker enregistré pour \`${playerName}\` [\`${player.id}\`]`,
  );

  const chan = message.client.channels.cache.get(env.DISCORD_TRACKING_CHANNEL);
  if (!chan?.isSendable()) throw "Invalid tracking channel";

  await chan.send(
    createInfoEmbed(`### [NEW] \`${playerName}\` [\`${player.id}\`]`),
  );
};
