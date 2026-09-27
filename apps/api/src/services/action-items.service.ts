import type { PostAlertInput, Tool } from "@debrief/integrations";
import { logger } from "../lib/logger.js";
import { withSpan } from "../lib/tracing.js";
import * as actionItemsRepository from "../repositories/action-items.repository.js";
import { ApiError } from "../utils/api-error.js";

export type ReviewDecision = "approve" | "reject";

type ReviewActionItemDeps = {
  slackAlertTool?: Tool<PostAlertInput, void>;
};

export async function reviewActionItem(
  itemId: string,
  decision: ReviewDecision,
  deps: ReviewActionItemDeps,
) {
  const item = await actionItemsRepository.findActionItemById(itemId);
  if (!item) {
    throw ApiError.notFound(`Action item ${itemId} not found`);
  }

  if (item.status !== "pending_review") {
    throw ApiError.conflict(
      `Action item ${itemId} is not pending review (current status: ${item.status})`,
    );
  }

  if (decision === "reject") {
    return actionItemsRepository.updateActionItemStatus(itemId, "rejected");
  }

  // decision === 'approve'
  const slackAlertTool = deps.slackAlertTool;

  if (!slackAlertTool) {
    // No Slack configured — nothing to execute, but the human decision is
    // still real. Mark it executed rather than silently doing nothing.
    return actionItemsRepository.updateActionItemStatus(itemId, "executed");
  }

  const alertInput: PostAlertInput = {
    task: item.task,
    owner: item.owner,
    dueDate: item.dueDate ? item.dueDate.toISOString() : null,
    priority: item.priority,
  };

  const alertResult = await withSpan(
    { runId: item.runId, type: "tool", name: "slack.postAlert", input: alertInput },
    () => slackAlertTool.execute(alertInput),
  );

  if (!alertResult.success) {
    logger.error("Slack alert failed for approved item", { itemId, error: alertResult.error });
    return actionItemsRepository.updateActionItemStatus(itemId, "failed");
  }

  return actionItemsRepository.updateActionItemStatus(itemId, "executed");
}
