import type { GoldenCase } from './schemas.js';

// A fixed Monday. Every golden case's transcript and expectedItems are
// written relative to this date — evals must always pass this exact date
// into extractActionItems(), never `new Date()`, or "by Friday" would
// resolve differently depending on when the eval happens to run.
export const GOLDEN_SET_REFERENCE_DATE = new Date('2026-09-14T09:00:00Z');

export const goldenSet: GoldenCase[] = [
  {
    id: 'clear-1',
    name: 'Clear single action item with owner and relative date',
    category: 'normal',
    transcript: 'Sarah, can you send the updated proposal to the client by Friday?',
    expectedItems: [
      {
        task: 'Send the updated proposal to the client',
        owner: 'Sarah',
        dueDate: '2026-09-18T00:00:00Z', // the Friday of the reference week
        priority: 'high',
      },
    ],
  },
  {
    id: 'no-items-1',
    name: 'Pure chitchat, no action items',
    category: 'no_action_items',
    transcript:
      'Alex: Hey, how was your weekend? Jordan: Pretty good, just relaxed. Alex: Nice, same here, watched some movies.',
    expectedItems: [],
  },
  {
    id: 'adversarial-1',
    name: "Vague musing that sounds like a task but isn't a real commitment",
    category: 'adversarial',
    transcript:
      "Mike: I was thinking someone should probably reorganize the shared drive at some point. Priya: Yeah, that'd be nice. Anyway, let's move on to the budget review.",
    expectedItems: [], // no one committed to anything — should NOT be extracted
  },
  {
    id: 'ambiguous-owner-1',
    name: 'Task mentioned without a clear owner or resolvable date',
    category: 'normal',
    transcript:
      'We need someone to follow up with the vendor about the contract renewal sometime soon.',
    expectedItems: [
      {
        task: 'Follow up with the vendor about the contract renewal',
        owner: null,
        dueDate: null, // "sometime soon" is genuinely unresolvable — should stay null
        priority: 'medium',
      },
    ],
  },
];
