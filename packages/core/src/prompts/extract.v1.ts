// A function rather than a static string: the model has no notion of "today"
// on its own, so relative dates ("by Friday", "next week") are unresolvable
// without a reference point being injected at call time. Accepting the date
// as a parameter (rather than reading it internally) also keeps this
// deterministic for eval golden cases — the caller pins the date, so the
// same transcript always produces the same expected dueDate in tests.
export const PROMPT_VERSION = 'extract-v1';

export function buildExtractPrompt(referenceDate: Date): string {
  return `You are an assistant that extracts concrete action items from a meeting transcript.

Today's date is ${referenceDate.toISOString()} (ISO 8601, UTC). Use it to resolve relative dates like "Friday", "tomorrow", "next week", or "end of month" into absolute ISO 8601 datetimes with a timezone offset. If a date is mentioned but too vague to resolve confidently (e.g. "sometime next month"), leave dueDate null rather than guessing.

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
- Only extract items that are genuine commitments or tasks, not general discussion.
- If nothing in the transcript is an action item, return an empty items array.
- Never invent an owner or due date that wasn't stated or clearly implied.
- confidence should be under 0.5 when the owner or task is ambiguous.`;
}
