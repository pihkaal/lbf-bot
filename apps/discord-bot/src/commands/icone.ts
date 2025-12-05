import { EmbedBuilder } from "discord.js";
import type { Command } from "~/commands";
import { searchPlayer, getClanInfos } from "~/services/wov";
import { replyError } from "~/utils/discord";

export const iconeCommand: Command = async (message, args) => {
  const playerName = args[0];
  if (!playerName) {
    await replyError(
      message,
      "Usage:`@LBF icone NOM_JOUEUR`, exemple: `@LBF icone Yuno`.\n**Attention les majuscules sont importantes**",
    );
    return;
  }

  const player = await searchPlayer(playerName);
  if (!player) {
    await replyError(
      message,
      "Joueur·euse non trouvé·e.\n**Attention les majuscules sont importantes**",
    );
    return;
  }

  if (!player.clanId) {
    await replyError(
      message,
      "Cette personne __n'a pas de clan__ ou __a caché son clan__.\n**Attention les majuscules sont importantes**",
    );
    return;
  }

  const clan = await getClanInfos(player.clanId);
  if (!clan) {
    await replyError(
      message,
      "Impossible de récupérer les informations du clan.",
    );
    return;
  }

  await message.reply({
    embeds: [
      new EmbedBuilder()
        .setDescription(
          `### ✅ Informations du clan\n\n**Nom:** \`\`\`${clan.name}\`\`\`\n**Tag:** \`\`\`${clan.tag}\`\`\``,
        )
        .setColor(65280),
    ],
    options: {
      allowedMentions: {
        repliedUser: false,
      },
    },
  });
};
