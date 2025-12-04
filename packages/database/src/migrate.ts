import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { env } from "~/env";

export async function runMigrations() {
  const db = drizzle(env.DATABASE_URL);

  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("✅ Database migrations completed");
}
