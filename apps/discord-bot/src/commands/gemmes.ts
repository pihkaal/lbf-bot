import type { Command } from "~/commands";
import { getAccountBalance, setAccountBalance } from "~/services/account";
import { getClanMembers } from "~/services/wov";
import { createErrorEmbed } from "~/utils/discord";

const STAFF_ROLE_ID = "1147963065640439900";

export const gemmesCommand: Command = async (message, args) => {
  const displayName = message.member?.displayName || message.author.username;
  let playerName = displayName.replace("🕸 |", "").trim();
  if (args.length >= 1) {
    playerName = args[0];
  }

  const clanMembers = await getClanMembers();

  let clanMember = clanMembers.find((x) => x.username === playerName);
  if (!clanMember) {
    await message.reply(
      createErrorEmbed(
        `\`${playerName}\` n'est pas dans le clan (la honte).\n**Attention les majuscules sont importantes**`,
      ),
    );
  } else {
    if (args.length === 2 && message.member) {
      if (!message.member.roles.cache.has(STAFF_ROLE_ID)) {
        await message.reply(
          createErrorEmbed("Tu t'es cru chez mémé ou quoi faut être staff"),
        );
        return;
      }

      if (
        (args[1][0] !== "+" && args[1][0] !== "-") ||
        !args[1] ||
        isNaN(Number(args[1].substring(1)))
      ) {
        await message.reply(
          createErrorEmbed(
            "Format: `@LBF gemmes <pseudo> <+GEMMES | -GEMMES>`\nExemple:`@LBF gemmes Yuno -10000`\n**Attention les majuscules sont importantes**",
          ),
        );
        return;
      }

      const mult = args[1][0] === "+" ? 1 : -1;
      const delta = Number(args[1].substring(1)) * mult;
      const balance = await getAccountBalance(clanMember.playerId);
      await setAccountBalance(
        clanMember.playerId,
        Math.max(0, balance + delta),
      );
    }

    const balance = await getAccountBalance(clanMember.playerId);
    await message.reply({
      embeds: [
        {
          description: `### 💎 Compte de ${playerName}\n\n\nGemmes disponibles: **${balance}**\n\n-# Voir avec <@294871767820795904> pour échanger contre skin/carte etc`,
          color: 4360641,
        },
      ],
    });
  }
};
