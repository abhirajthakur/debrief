import type { NewUserRow, UserRow } from "@debrief/db";
import { db, users } from "@debrief/db";

export async function createUser(values: Omit<NewUserRow, "id">): Promise<UserRow> {
  const [row] = await db.insert(users).values(values).returning();
  if (!row) {
    throw new Error("Failed to insert user");
  }
  return row;
}

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const user = await db.query.users.findFirst({
    where: {
      email,
    },
  });
  return user;
}

export async function findUserById(userId: string): Promise<UserRow | undefined> {
  const user = await db.query.users.findFirst({
    where: {
      id: userId,
    },
  });
  return user;
}
