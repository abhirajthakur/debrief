import type { ActionItemStatus } from "@debrief/contracts";
import type { ActionItemRow, NewActionItemRow } from "@debrief/db";
import { actionItems, db, eq } from "@debrief/db";

export async function insertActionItems(items: NewActionItemRow[]): Promise<ActionItemRow[]> {
  if (items.length === 0) {
    return [];
  }
  return await db.insert(actionItems).values(items).returning();
}

export async function findActionItemById(itemId: string): Promise<ActionItemRow | undefined> {
  const actionItem = await db.query.actionItems.findFirst({
    where: {
      id: itemId,
    },
  });
  return actionItem;
}

export async function findActionItemsByRunId(runId: string): Promise<ActionItemRow[]> {
  const actionItems = await db.query.actionItems.findMany({
    where: {
      runId,
    },
  });
  return actionItems;
}

export async function updateActionItemStatus(
  itemId: string,
  status: ActionItemStatus,
): Promise<ActionItemRow> {
  const [row] = await db
    .update(actionItems)
    .set({ status })
    .where(eq(actionItems.id, itemId))
    .returning();

  if (!row) {
    throw new Error(`Failed to update action item ${itemId}`);
  }
  return row;
}
