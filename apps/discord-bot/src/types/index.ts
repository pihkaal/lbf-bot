export type QuestResult = {
  quest: {
    id: string;
    promoImageUrl: string;
    promoImagePrimaryColor: string;
  };
  participants: Array<QuestParticipant>;
};

export type QuestParticipant = {
  playerId: string;
  username: string;
  xp: number;
};

export type DiscordMessage = {
  content: string;
  embeds: Array<DiscordEmbed>;
};

export type DiscordEmbed = {
  title?: string;
  description: string;
  image?: {
    url: string;
  };
  color: number;
};

export type TrackedPlayers = Record<string, string[]>;
