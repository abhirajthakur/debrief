import type { ActionItemStatus } from '@debrief/contracts';

export const AUTO_EXECUTE_CONFIDENCE_THRESHOLD = 0.75;

export function decideActionItemStatus(confidence: number): ActionItemStatus {
  return confidence >= AUTO_EXECUTE_CONFIDENCE_THRESHOLD ? 'auto_executed' : 'pending_review';
}
