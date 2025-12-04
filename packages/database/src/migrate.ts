import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { env } from "~/env";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runMigrations() {
  console.log("Connecting to database...");
  const db = drizzle(env.DATABASE_URL);

  const migrationsFolder = join(__dirname, "..", "drizzle");
  console.log(`Running migrations from: ${migrationsFolder}`);

  await migrate(db, { migrationsFolder });

  console.log("✅ Database migrations completed");
}
