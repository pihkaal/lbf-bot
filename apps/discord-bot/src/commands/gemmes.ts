import { EmbedBuilder } from "discord.js";
import { env } from "~/env";
import type { Command } from "~/commands";
import { getAccountBalance, setAccountBalance } from "~/services/account";
import { getClanMembers } from "~/services/wov";
import { replyError } from "~/utils/discord";

export const gemmesCommand: Command = async (message, args) => {
  // retrieve player name
  // NOTE: discord members have display name formatted like "🕸 | InGamePseudo"
  const displayName = message.member?.displayName || message.author.username;
  const playerName = args[0] || displayName.replace("🕸 |", "").trim();

  // get clan member
  const clanMembers = await getClanMembers();
  const clanMember = clanMembers.find((x) => x.username === playerName);
  if (!clanMember) {
    await replyError(
      message,
      `\`${playerName}\` n'est pas dans le clan (la honte).\n**Attention les majuscules sont importantes**`,
    );
    return;
  }

  // handle balance modification (staff only)
  if (args.length === 2) {
    if (!message.member?.roles.cache.has(env.DISCORD_STAFF_ROLE_ID)) {
      await replyError(
        message,
        "Tu t'es cru chez mémé ou quoi faut être staff",
      );
      return;
    }

    const op = args[1][0];
    const amount = Number(args[1].substring(1));
    if ((op !== "+" && op !== "-") || args[1].length === 1 || isNaN(amount)) {
      await replyError(
        message,
        "Format: `@LBF gemmes <pseudo> <+GEMMES | -GEMMES>`\nExemple: `@LBF gemmes Yuno -10000`\n**Attention les majuscules sont importantes**",
      );
      return;
    }

    const balance = await getAccountBalance(clanMember.playerId);
    const delta = amount * (op === "+" ? 1 : -1);
    await setAccountBalance(clanMember.playerId, Math.max(0, balance + delta));
  }

  // display balance
  const balance = await getAccountBalance(clanMember.playerId);
  await message.reply({
    embeds: [
      new EmbedBuilder()
        .setDescription(
          // TODO: mention here instead of in the env
          `### 💎 Compte de ${playerName}\n\n\nGemmes disponibles: **${balance}**\n\n-# Voir avec ${env.DISCORD_REWARDS_GIVER} pour échanger contre skin/carte etc`,
        )
        .setColor(0x4289c1),
    ],
    options: {
      allowedMentions: {
        repliedUser: false,
      },
    },
  });
};
