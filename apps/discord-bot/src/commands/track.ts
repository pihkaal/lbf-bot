import type { Command } from "~/commands";
import { trackWovPlayer } from "~/services/tracking";
import { searchPlayer } from "~/services/wov";
import { createErrorEmbed, createInfoEmbed } from "~/utils/discord";
import { env } from "~/env";

const STAFF_ROLE_ID = "1147963065640439900";

export const trackCommand: Command = async (message, args) => {
  const client = message.client;
  if (!message.member) return;
  if (!message.member.roles.cache.has(STAFF_ROLE_ID)) {
    await message.reply(
      createErrorEmbed("Tu t'es cru chez mémé ou quoi faut être staff"),
    );
    return;
  }

  let playerName = args[0];
  if (!playerName) {
    await message.reply(
      createErrorEmbed(
        "Usage:`@LBF track NOM_JOUEUR`, exemple: `@LBF track Yuno`.\n**Attention les majuscules sont importantes**",
      ),
    );
    return;
  }

  const player = await searchPlayer(playerName);
  if (!player) {
    await message.reply(
      createErrorEmbed(
        "Cette personne n'existe pas.\n**Attention les majuscules sont importantes**",
      ),
    );
    return;
  }

  const res = await trackWovPlayer(player.id);
  switch (res.event) {
    case "notFound": {
      await message.reply(
        createErrorEmbed(
          "Cette personne n'existe pas.\n**Attention les majuscules sont importantes**",
        ),
      );
      return;
    }

    case "registered": {
      await message.reply(
        createInfoEmbed(
          `Tracker enregistré pour \`${playerName}\` [\`${player.id}\`]`,
        ),
      );

      const chan = client.channels.cache.get(env.DISCORD_TRACKING_CHANNEL);
      if (!chan?.isSendable()) throw "Invalid tracking channel";

      await chan.send(
        createInfoEmbed(`### [NEW] \`${playerName}\` [\`${player.id}\`]`),
      );
      return;
    }
    case "none": {
      await message.reply(
        createInfoEmbed(
          `Tracker déjà enregistré pour \`${playerName}\` [\`${player.id}\`]`,
        ),
      );
      return;
    }
    case "changed": {
      // ignored
      break;
    }
  }
};
