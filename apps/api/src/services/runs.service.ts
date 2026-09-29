import type { CreateRunInput } from "@debrief/contracts";
import { decideActionItemStatus, extractActionItems } from "@debrief/core";
import type { PostDigestInput, Tool } from "@debrief/integrations";
import type { LLMProvider } from "@debrief/providers";
import { logger } from "../lib/logger.js";
import { withSpan } from "../lib/tracing.js";
import * as actionItemsRepository from "../repositories/action-items.repository.js";
import * as runsRepository from "../repositories/runs.repository.js";
import * as spansRepository from "../repositories/spans.repository.js";
import { ApiError } from "../utils/api-error.js";

type CreateRunDeps = {
  actorProvider: LLMProvider;
  actorProviderName: string;
  actorModel: string;
  slackDigestTool?: Tool<PostDigestInput, void>;
};

export async function createRun(userId: string, input: CreateRunInput, deps: CreateRunDeps) {
  logger.info("Creating run", {
    provider: deps.actorProviderName,
    model: deps.actorModel,
  });

  const runRow = await runsRepository.createRun({
    userId,
    transcript: input.transcript,
    status: "extracting",
    promptVersion: "pending", // overwritten once extraction finishes
    model: `${deps.actorProviderName}/${deps.actorModel}`,
  });

  logger.info("Run created; starting action item extraction", {
    userId,
    runId: runRow.id,
  });

  const { result, promptVersion } = await withSpan(
    {
      runId: runRow.id,
      type: "llm",
      name: `extract.${deps.actorProviderName}`,
      input: { model: deps.actorModel, transcriptLength: input.transcript.length },
    },
    () =>
      extractActionItems({
        provider: deps.actorProvider,
        model: deps.actorModel,
        transcript: input.transcript,
      }),
  );

  logger.info("Action item extraction completed", {
    runId: runRow.id,
    itemCount: result.items.length,
    promptVersion,
  });

  const insertedItems = await actionItemsRepository.insertActionItems(
    result.items.map((item) => ({
      runId: runRow.id,
      task: item.task,
      owner: item.owner,
      dueDate: item.dueDate ? new Date(item.dueDate) : null,
      priority: item.priority,
      confidence: item.confidence,
      sourceQuote: item.sourceQuote,
      status: decideActionItemStatus(item.confidence),
    })),
  );

  logger.info("Inserted action items", {
    runId: runRow.id,
    count: insertedItems.length,
  });

  // Posting the digest is best-effort: a Slack failure shouldn't fail a run
  // that otherwise extracted and persisted everything correctly.
  const slackDigestTool = deps.slackDigestTool;
  if (slackDigestTool) {
    logger.info("Posting Slack digest", {
      runId: runRow.id,
    });

    const digestInput: PostDigestInput = {
      summary: result.summary,
      items: insertedItems.map((item) => ({
        task: item.task,
        owner: item.owner,
        dueDate: item.dueDate ? item.dueDate.toISOString() : null,
        priority: item.priority,
        status: item.status,
      })),
    };

    const digestResult = await withSpan(
      { runId: runRow.id, type: "tool", name: "slack.postDigest", input: digestInput },
      () => slackDigestTool.execute(digestInput),
    );

    if (!digestResult.success) {
      logger.error("Slack digest failed", {
        runId: runRow.id,
        error: digestResult.error,
      });
    } else {
      logger.info("Slack digest posted successfully", {
        runId: runRow.id,
      });
    }
  }

  await runsRepository.completeRun(runRow.id, promptVersion);

  logger.info("Run completed successfully", {
    runId: runRow.id,
  });

  return { runId: runRow.id, summary: result.summary, items: insertedItems };
}

export async function listRuns(userId: string) {
  return runsRepository.findAllRuns(userId);
}

export async function getRunDetail(runId: string, userId: string) {
  const run = await runsRepository.findRunById(runId, userId);
  if (!run) {
    throw ApiError.notFound(`Run ${runId} not found`);
  }

  const [items, traceSpans] = await Promise.all([
    actionItemsRepository.findActionItemsByRunId(runId),
    spansRepository.findSpansByRunId(runId),
  ]);

  return { run, items, spans: traceSpans };
}
