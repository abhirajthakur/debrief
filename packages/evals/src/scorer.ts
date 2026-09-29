import type { JudgeVerdict } from "./schemas.js";

export type ScoredCase = {
  goldenCaseId: string;
  goldenCaseName: string;
  verdict: JudgeVerdict;
};

export type EvalSummary = {
  totalCases: number;
  passedCases: number;
  passRate: number;
  hallucinationRate: number; // fraction of cases with at least one hallucinated item
};

export function scoreEvalRun(results: ScoredCase[]): EvalSummary {
  const totalCases = results.length;
  const passedCases = results.filter((r) => r.verdict.passed).length;
  const hallucinatedCases = results.filter((r) => r.verdict.hallucinatedItems.length > 0).length;

  return {
    totalCases,
    passedCases,
    passRate: totalCases === 0 ? 0 : passedCases / totalCases,
    hallucinationRate: totalCases === 0 ? 0 : hallucinatedCases / totalCases,
  };
}
