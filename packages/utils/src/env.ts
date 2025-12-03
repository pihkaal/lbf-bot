import "dotenv/config";
import { z } from "zod";

export const parseEnv = <T extends z.ZodRawShape>(vars: T) => {
  const schema = z.object(vars);
  const result = schema.safeParse(process.env);
  if (!result.success) {
    console.error("ERROR: Environment variable validation failed:");
    for (const issue of result.error.issues) {
      console.error(`- ${issue.path.join(".")}: ${issue.message}`);
    }

    process.exit(1);
  }

  return result.data;
};
