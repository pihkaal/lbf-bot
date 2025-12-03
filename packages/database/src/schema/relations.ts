import { relations } from "drizzle-orm";
import { trackedPlayers, usernameHistory } from "./tables";

/**
 * TRACKING SYSTEM
 */
export const trackedPlayersRelations = relations(
  trackedPlayers,
  ({ many }) => ({
    usernameHistory: many(usernameHistory),
  }),
);

export const usernameHistoryRelations = relations(
  usernameHistory,
  ({ one }) => ({
    trackedPlayer: one(trackedPlayers, {
      fields: [usernameHistory.playerId],
      references: [trackedPlayers.playerId],
    }),
  }),
);
