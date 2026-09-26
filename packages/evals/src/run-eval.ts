import { extractActionItems, PROMPT_VERSION } from "@debrief/core";
import { getProvider, type LLMProvider } from "@debrief/providers";
import { GOLDEN_SET_REFERENCE_DATE, goldenSet } from "./golden-set.js";
import { judgeExtraction } from "./judge.js";
import { type ScoredCase, scoreEvalRun } from "./scorer.js";

async function main() {
  // --skip-judge: run extraction only, print raw output vs expected for
  // manual comparison. Zero judge API calls — use this while iterating on
  // a prompt, and only run the full judged eval once it looks promising.
  // The judge's free tier is limited (e.g. 20 req/day on gemini-2.5-flash),
  // and a full sweep costs up to one call per golden case.
  const skipJudge = process.argv.includes("--skip-judge");

  const actorProviderName = process.env.LLM_ACTOR_PROVIDER ?? "groq";
  const actorModel = process.env.LLM_ACTOR_MODEL ?? "openai/gpt-oss-20b";
  const actorApiKey =
    actorProviderName === "groq" ? process.env.GROQ_API_KEY : process.env.GEMINI_API_KEY;

  if (!actorApiKey) {
    throw new Error(`Missing API key for LLM_ACTOR_PROVIDER="${actorProviderName}"`);
  }
  const actorProvider = getProvider(actorProviderName, { apiKey: actorApiKey });

  let judgeProvider: LLMProvider | undefined;
  let judgeProviderName = "";
  let judgeModel = "";

  if (!skipJudge) {
    judgeProviderName = process.env.LLM_JUDGE_PROVIDER ?? "gemini";
    judgeModel = process.env.LLM_JUDGE_MODEL ?? "gemini-3.8-flash";
    const judgeApiKey =
      judgeProviderName === "gemini" ? process.env.GEMINI_API_KEY : process.env.GROQ_API_KEY;
    if (!judgeApiKey) {
      throw new Error(`Missing API key for LLM_JUDGE_PROVIDER="${judgeProviderName}"`);
    }
    judgeProvider = getProvider(judgeProviderName, { apiKey: judgeApiKey });
  }

  const results: ScoredCase[] = [];

  for (const goldenCase of goldenSet) {
    process.stdout.write(`Running: ${goldenCase.name}\n`);

    const { result } = await extractActionItems({
      provider: actorProvider,
      model: actorModel,
      transcript: goldenCase.transcript,
      referenceDate: GOLDEN_SET_REFERENCE_DATE,
    });

    if (skipJudge) {
      process.stdout.write(`  Extracted: ${JSON.stringify(result.items, null, 2)}\n`);
      process.stdout.write(`  Expected:  ${JSON.stringify(goldenCase.expectedItems, null, 2)}\n\n`);
      continue;
    }

    const verdict = await judgeExtraction({
      judgeProvider: judgeProvider!,
      judgeModel,
      goldenCase,
      actualItems: result.items,
    });

    results.push({ goldenCaseId: goldenCase.id, goldenCaseName: goldenCase.name, verdict });
    process.stdout.write(`  ${verdict.passed ? "PASS" : "FAIL"} — ${verdict.reasoning}\n`);
  }

  if (skipJudge) {
    process.stdout.write(
      "Skipped judging (--skip-judge). Compare extracted vs expected above manually.\n",
    );
    return;
  }

  const summary = scoreEvalRun(results);

  process.stdout.write("\n--- Eval Summary ---\n");
  process.stdout.write(`Prompt version: ${PROMPT_VERSION}\n`);
  process.stdout.write(`Actor: ${actorProviderName}/${actorModel}\n`);
  process.stdout.write(`Judge: ${judgeProviderName}/${judgeModel}\n`);
  process.stdout.write(
    `Pass rate: ${(summary.passRate * 100).toFixed(1)}% (${summary.passedCases}/${summary.totalCases})\n`,
  );
  process.stdout.write(`Hallucination rate: ${(summary.hallucinationRate * 100).toFixed(1)}%\n`);

  if (summary.passRate < 1) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
