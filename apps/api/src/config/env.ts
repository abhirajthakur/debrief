import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z
    .string()
    .refine((val) => val.startsWith('postgres://') || val.startsWith('postgresql://'), {
      message: 'DATABASE_URL must be a postgres connection string',
    }),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  LLM_ACTOR_PROVIDER: z.string().default('groq'),
  LLM_ACTOR_MODEL: z.string().default('openai/gpt-oss-20b'),

  GROQ_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  JWT_SECRET: z.string().min(16, { error: 'JWT_SECRET must be at least 16 characters' }),
  JWT_EXPIRES_IN: z.string().default('7d'),

  ENCRYPTION_KEY: z.string().regex(/^[0-9a-f]{64}$/i, {
    error: 'ENCRYPTION_KEY must be a 64-character hex string (32 bytes)',
  }),

  // Create a Slack app at https://api.slack.com/apps with the
  // incoming-webhook scope, then set its redirect URL to match this value.
  SLACK_CLIENT_ID: z.string(),
  SLACK_CLIENT_SECRET: z.string(),
  SLACK_REDIRECT_URI: z.url(),
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
