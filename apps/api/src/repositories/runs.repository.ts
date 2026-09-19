import type { ActionItemRow, NewActionItemRow, NewRunRow, RunRow } from "@debrief/db";
import { actionItems, db, eq, runs } from "@debrief/db";
import { logger } from "../lib/logger.js";

export async function createRun(values: Omit<NewRunRow, "id">) {
  const [row] = await db.insert(runs).values(values).returning();
  if (!row) {
    logger.error("Failed to insert run", {
      data: values,
    });
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

export async function findAllRuns(limit = 50): Promise<RunRow[]> {
  return await db.query.runs.findMany({
    orderBy: {
      startedAt: "desc",
    },
    limit,
  });
}

export async function findRunById(runId: string): Promise<RunRow | undefined> {
  const row = await db.query.runs.findFirst({
    where: {
      id: runId,
    },
  });
  return row;
}

export async function findActionItemsByRunId(runId: string): Promise<ActionItemRow[]> {
  const actionItems = await db.query.actionItems.findMany({
    where: {
      runId,
    },
  });
  return actionItems;
}
