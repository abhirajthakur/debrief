import { extractActionItems } from "@debrief/core";
import * as runsRepository from "../repositories/runs.repository.js";

import type { CreateRunInput } from "@debrief/contracts";
import type { LLMProvider } from "@debrief/providers";

type CreateRunDeps = {
  actorProvider: LLMProvider;
  actorProviderName: string;
  actorModel: string;
};

export async function createRun(input: CreateRunInput, deps: CreateRunDeps) {
  const runRow = await runsRepository.createRun({
    transcript: input.transcript,
    status: "extracting",
    promptVersion: "pending", // overwritten once extraction finishes
    model: `${deps.actorProviderName}/${deps.actorModel}`,
  });

  const { result, promptVersion } = await extractActionItems({
    provider: deps.actorProvider,
    model: deps.actorModel,
    transcript: input.transcript,
  });

  const insertedItems = await runsRepository.insertActionItems(
    result.items.map((item) => ({
      runId: runRow.id,
      task: item.task,
      owner: item.owner,
      dueDate: item.dueDate ? new Date(item.dueDate) : null,
      priority: item.priority,
      confidence: item.confidence,
      sourceQuote: item.sourceQuote,
      // status defaults to "pending_review" — confidence-gated
      // auto-execution is decided once the router/tools step exists.
    })),
  );

  await runsRepository.completeRun(runRow.id, promptVersion);

  return { runId: runRow.id, summary: result.summary, items: insertedItems };
}
