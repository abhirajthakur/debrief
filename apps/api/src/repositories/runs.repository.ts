import type { NewActionItemRow, NewRunRow } from "@debrief/db";
import { actionItems, db, eq, runs } from "@debrief/db";

export async function createRun(values: Omit<NewRunRow, "id">) {
  const [row] = await db.insert(runs).values(values).returning();
  if (!row) {
    throw new Error("Failed to insert run");
  }
  return row;
}

export async function completeRun(runId: string, promptVersion: string) {
  await db
    .update(runs)
    .set({ status: "completed", promptVersion, finishedAt: new Date() })
    .where(eq(runs.id, runId));
}

export async function insertActionItems(items: NewActionItemRow[]) {
  if (items.length === 0) {
    return [];
  }

  const insertedActionItems = await db.insert(actionItems).values(items).returning();

  return insertedActionItems;
}
