import { z } from "zod";

export const signupInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8, { error: "Password must be at least 8 characters" }),
});
export type SignupInput = z.infer<typeof signupInputSchema>;

export const loginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

// Public-safe user shape — never includes passwordHash. This is what gets
// returned from signup/login, never the raw db row.
export const publicUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  createdAt: z.iso.datetime(),
});
export type PublicUser = z.infer<typeof publicUserSchema>;

export const authResponseSchema = z.object({
  user: publicUserSchema,
  token: z.string(),
});
export type AuthResponse = z.infer<typeof authResponseSchema>;
