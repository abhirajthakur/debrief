import type { LoginInput, PublicUser, SignupInput } from "@debrief/contracts";
import type { UserRow } from "@debrief/db";
import { signToken } from "../lib/jwt.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import * as usersRepository from "../repositories/users.repository.js";
import { ApiError } from "../utils/api-error.js";

function toPublicUser(user: UserRow): PublicUser {
  return { id: user.id, email: user.email, createdAt: user.createdAt.toISOString() };
}

export async function signup(input: SignupInput) {
  const existing = await usersRepository.findUserByEmail(input.email);
  if (existing) {
    throw ApiError.conflict("Email is already registered");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await usersRepository.createUser({ email: input.email, passwordHash });

  const token = signToken({ sub: user.id, email: user.email });
  return { user: toPublicUser(user), token };
}

export async function login(input: LoginInput) {
  const user = await usersRepository.findUserByEmail(input.email);
  // Same generic error whether the email doesn't exist or the password is
  // wrong — confirming an email is registered is its own information leak.
  const invalidCredentials = () => ApiError.badRequest("Invalid email or password");

  if (!user) {
    throw invalidCredentials();
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw invalidCredentials();
  }

  const token = signToken({ sub: user.id, email: user.email });
  return { user: toPublicUser(user), token };
}
