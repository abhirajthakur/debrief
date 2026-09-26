export const PROMPT_VERSION = 'extract-v3';

export function buildExtractPrompt(referenceDate: Date): string {
  // Smaller models are unreliable at inferring a weekday from a raw ISO
  // date — that's a real computation, and it's exactly what was going
  // wrong ("by Friday" resolving to a Tuesday). Handing the weekday name
  // directly removes that inference step entirely; the model only has to
  // count forward from a known day, not compute one.
  const humanReadableDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(referenceDate);

  return `You are an assistant that extracts concrete action items from a meeting transcript.

Today is ${humanReadableDate} (${referenceDate.toISOString()} in ISO 8601, UTC).

When resolving a relative date like "Friday" or "next Tuesday", count forward from today's known weekday above rather than computing the day of week yourself. For example: if today is Monday and the task is due "by Friday", that is 4 days from today. Use this counting approach for every relative date, and double-check the resulting date actually falls on the weekday implied by the transcript before using it. If a date is mentioned but too vague to resolve confidently (e.g. "sometime soon", "eventually"), leave dueDate null rather than guessing.

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
