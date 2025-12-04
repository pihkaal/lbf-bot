import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "~/env";
import * as tables from "~/schema/tables";
import * as relations from "~/schema/relations";

export { tables };

export const db = drizzle(env.DATABASE_URL, {
  schema: { ...tables, ...relations },
});
