import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "~/env";
import * as tables from "~/schema/tables";
import * as relations from "~/schema/relations";

export { tables };

export const db = drizzle(env.DATABASE_URL, {
  schema: { ...tables, ...relations },
});

export { redis } from "~/redis";
export * from "drizzle-orm";
