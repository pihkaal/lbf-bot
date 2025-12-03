import type { Command } from "~/commands";
import { searchPlayer, getClanInfos } from "~/services/wov";
import { createErrorEmbed } from "~/utils/discord";

export const iconeCommand: Command = async (message, args) => {
  let playerName = args[0];
  if (!playerName) {
    await message.reply(
      createErrorEmbed(
        "Usage:`@LBF icone NOM_JOUEUR`, exemple: `@LBF icone Yuno`.\n**Attention les majuscules sont importantes**",
      ),
    );
    return;
  }

  const player = await searchPlayer(playerName);
  if (!player) {
    await message.reply(
      createErrorEmbed(
        "Joueur·euse non trouvé·e.\n**Attention les majuscules sont importantes**",
      ),
    );
    return;
  }

  if (!player.clanId) {
    await message.reply(
      createErrorEmbed(
        "Cette personne __n'a pas de clan__ ou __a caché son clan__.\n**Attention les majuscules sont importantes**",
      ),
    );
    return;
  }

  const clan = await getClanInfos(player.clanId);
  if (!clan) {
    await message.reply(
      createErrorEmbed("Impossible de récupérer les informations du clan."),
    );
    return;
  }

  await message.reply({
    embeds: [
      {
        description: `### ✅ Informations du clan\n\n**Nom:** \`\`\`${clan.name}\`\`\`\n**Tag:** \`\`\`${clan.tag}\`\`\``,
        color: 65280,
      },
    ],
  });
};
