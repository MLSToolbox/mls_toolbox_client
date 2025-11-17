import { z } from "zod";

export const envSchema = z.object({
  apiUrl: z.url(),
  apiTimeout: z.number().positive().default(10000),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnvironment(config: unknown): Environment {
  try {
    return envSchema.parse(config);
  } catch (error) {
    console.error("Environment validation failed:", error);
    throw new Error("Invalid environment configuration");
  }
}
