import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z
    .string()
    .refine((val) => val.startsWith("postgres://") || val.startsWith("postgresql://"), {
      message: "DATABASE_URL must be a postgres connection string",
    }),

  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  LLM_ACTOR_PROVIDER: z.string().default("groq"),
  LLM_ACTOR_MODEL: z.string().default("openai/gpt-oss-20b"),

  GROQ_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  SLACK_WEBHOOK_URL: z.url().optional(),
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
