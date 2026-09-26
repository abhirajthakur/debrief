export const PROMPT_VERSION = 'extract-v4';

export function buildExtractPrompt(referenceDate: Date): string {
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

Rules for deciding what counts as a real action item:
- Extract it if the transcript frames it as work that actually needs to happen — even if no specific person has been assigned yet. Example: "we need someone to follow up with the vendor" IS a real action item, with owner: null, because it's stated as necessary work, not a hopeful suggestion.
- Do NOT extract it if it's a hedged, optional musing with no real decision behind it — words like "probably", "at some point", "it'd be nice if" are signals of this. Example: "someone should probably reorganize the drive at some point" is NOT a real action item — it's a passing idea, not identified work.
- The distinguishing question: is this framed as work that must actually get done (even if unassigned), or is it just a casual suggestion nobody has decided to act on? Extract only the former.
- An item extracted without a named owner should get lower confidence (below 0.5) than one with a clear owner — the lack of an owner is a real signal of uncertainty, but it is NOT on its own a reason to skip the item entirely.
- If nothing in the transcript is a genuine action item, return an empty items array — an empty list is a correct answer, not a failure to find something.
- Never invent an owner or due date that wasn't stated or clearly implied.`;
}
