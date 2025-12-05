import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createLogger } from "@lbf-bot/utils";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { env } from "~/env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbLogger = createLogger({ prefix: "db" });

export async function runMigrations() {
  const db = drizzle(env.DATABASE_URL);
  const migrationsFolder = join(__dirname, "..", "drizzle");

  dbLogger.info(`Running migrations`);
  await migrate(db, { migrationsFolder });
  dbLogger.info("Migrations completed");
}
