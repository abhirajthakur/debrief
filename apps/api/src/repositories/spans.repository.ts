import type { NewSpanRow, SpanRow } from "@debrief/db";
import { db, spans } from "@debrief/db";

export async function createSpan(values: Omit<NewSpanRow, "id">) {
  await db.insert(spans).values(values);
}

export async function findSpansByRunId(runId: string): Promise<SpanRow[]> {
  const spans = await db.query.spans.findMany({
    where: {
      runId,
    },
    orderBy: {
      startedAt: "asc",
    },
  });

  return spans;
}
