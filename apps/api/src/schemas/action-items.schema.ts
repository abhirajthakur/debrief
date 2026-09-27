import * as z from "zod";

export const actionItemIdParamsSchema = z.object({
  itemId: z.uuid(),
});
export type ActionItemIdParams = z.infer<typeof actionItemIdParamsSchema>;

export const reviewActionItemBodySchema = z.object({
  decision: z.enum(["approve", "reject"]),
});
export type ReviewActionItemBody = z.infer<typeof reviewActionItemBodySchema>;
