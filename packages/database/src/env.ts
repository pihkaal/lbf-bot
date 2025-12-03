import { z } from "zod";
import { parseEnv } from "@lbf-bot/utils";

export const env = parseEnv({
  DATABASE_URL: z.url().min(1, "Required"),
});
