export type { DigestItem, PostAlertInput, PostDigestInput } from "./adapters/slack/tools.js";
export * from "./errors.js";
export { getIntegration, registerIntegration } from "./registry.js";
export * from "./types.js";

import { createSlackIntegration } from "./adapters/slack/index.js";
import { registerIntegration } from "./registry.js";

registerIntegration("slack", createSlackIntegration);

// To add an integration later: write adapters/<name>/index.ts implementing
// Integration, add one line here. Nothing outside this package changes.
