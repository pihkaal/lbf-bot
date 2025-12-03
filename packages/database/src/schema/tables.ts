import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * ECONOMY SYSTEM
 */
export const accounts = pgTable("accounts", {
  playerId: uuid("player_id").primaryKey(),
  balance: integer("balance").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * TRACKING SYSTEM
 */
export const trackedPlayers = pgTable("tracked_players", {
  playerId: uuid("player_id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const usernameHistory = pgTable("username_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => trackedPlayers.playerId, { onDelete: "cascade" }),
  username: text("username").notNull(),
  firstSeenAt: timestamp("first_seen_at").notNull().defaultNow(),
});
