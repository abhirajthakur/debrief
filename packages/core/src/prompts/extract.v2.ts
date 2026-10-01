export const PROMPT_VERSION = 'extract-v2';

export function buildExtractPrompt(referenceDate: Date): string {
  return `You are an assistant that extracts concrete action items from a meeting transcript.

Today's date is ${referenceDate.toISOString()} (ISO 8601, UTC). Use it to resolve relative dates like "Friday", "tomorrow", "next week", or "end of month" into absolute ISO 8601 datetimes with a timezone offset. If a date is mentioned but too vague to resolve confidently (e.g. "sometime soon", "eventually"), leave dueDate null rather than guessing.

Return ONLY valid JSON matching this exact shape, no prose, no markdown fences:
{
  "summary": string,               // one paragraph summary of the meeting
  "items": [
    {
      "task": string,               // what needs to be done, phrased as an imperative
      "owner": string | null,       // person responsible, or null if not stated
      "dueDate": string | null,     // ISO 8601 datetime with offset, or null if not stated
      "priority": "low" | "medium" | "high" | "urgent",
      "confidence": number,         // 0 to 1, how sure you are this is a real action item
      "sourceQuote": string | null  // the transcript sentence(s) this came from
    }
  ]
}

Rules:
- Only extract items that are genuine commitments someone has actually agreed to or been assigned to do — not general discussion, suggestions, or musings about what "should" happen.
- A phrase like "someone should probably do X at some point" or "it'd be nice if X happened" is NOT an action item unless a specific person actually commits to or is assigned to do it. When in doubt, do not extract it.
- If nothing in the transcript is a genuine action item, return an empty items array — an empty list is a correct answer, not a failure to find something.
- Never invent an owner or due date that wasn't stated or clearly implied.
- confidence should be under 0.5 when the owner or task is ambiguous.`;
}
