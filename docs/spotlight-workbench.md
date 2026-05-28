# Spotlight Workbench MVP

Spotlight Workbench is an experimental prompt-evaluation surface for testing whether an LLM can turn a source document into a **spotlight** instead of a generic summary.

A summary tries to cover the whole document evenly. A spotlight identifies the most strategically useful, surprising, legally important, or reader-engaging part of the document and turns it into a faithful mini-story with source anchors and overclaim limits.

## MVP Goal

Prove one behavior:

> Can the model identify the most strategically interesting part of a document and explain why it matters without hallucinating?

This is not a fine-tuning project yet. The MVP uses prompt orchestration first. Fine-tuning or DPO should wait until the app has collected enough high-quality `chosen_spotlight` vs `rejected_summary` pairs.

## User Flow

1. Paste a source document.
2. Select document type.
3. Generate a workbench run.
4. Compare the generic summary against the spotlight.
5. Inspect candidate hooks, selected hook, source anchors, and faithfulness risks.
6. Export the run as JSON for later training/evaluation.

## Output Contract

The model must return JSON with this shape:

```json
{
  "summary": {
    "text": "string",
    "coveredIssues": ["string"]
  },
  "hooks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "whyItMayMatter": "string",
      "sourceSupport": ["string"],
      "scores": {
        "strategicValue": 1,
        "readerInterest": 1,
        "sourceSupport": 1,
        "legalUsefulness": 1,
        "overclaimRisk": 1
      }
    }
  ],
  "selectedHook": {
    "id": "string",
    "title": "string",
    "reasonSelected": "string"
  },
  "spotlight": {
    "title": "string",
    "spotlight": "string",
    "whyItMatters": "string",
    "sourceAnchors": [
      {
        "claim": "string",
        "supportingText": "string",
        "location": "string"
      }
    ],
    "whatNotToOverclaim": ["string"],
    "nextBestQuestion": "string"
  },
  "faithfulnessCheck": {
    "unsupportedClaims": ["string"],
    "weakClaims": ["string"],
    "missingSourceAnchors": ["string"],
    "riskLevel": "low",
    "pass": true
  },
  "comparison": {
    "whySummaryIsDifferent": "string",
    "whySpotlightIsBetterForEngagement": "string",
    "failureModeToWatch": "string"
  }
}
```

## Required Agent Steps

### 1. Summary Baseline

Generate a faithful, ordinary summary. It should cover the main points evenly and avoid optimizing for reader interest.

### 2. Hook Finder

Extract 3-7 possible spotlight hooks. A hook can be legally useful, strategically important, surprising, unusually concrete, or directly relevant to a next action.

### 3. Hook Scorer

Score every hook from 1-5 for:

- strategic value
- reader interest
- source support
- legal usefulness, when applicable
- overclaim risk

The selected hook should not merely sound dramatic. It needs strong source support and practical value.

### 4. Spotlight Writer

Write the spotlight around the selected hook only. It should be faithful, selective, readable, and self-contained.

### 5. Faithfulness Checker

Check the spotlight against the source. Flag unsupported claims, overconfident legal conclusions, missing anchors, and places where the wording should be softened.

## VA Decision Mode

When `documentType` is `va_decision`, prioritize hooks involving:

- Board legal error
- inadequate reasons or bases
- duty to assist failure
- inadequate VA medical opinion
- favorable finding ignored or minimized
- favorable evidence discounted
- missing nexus bridge
- effective-date issue
- TDIU issue
- secondary-service-connection theory
- AMA lane decision point
- contradiction between findings and conclusion

The output should avoid saying that an appeal will win. It should identify possible development issues, reasons-or-bases problems, evidentiary gaps, or next-best review questions.

## Local MVP Route

A standalone prototype lives at:

```text
/spotlight-workbench.html
```

It is intentionally self-contained so it does not disrupt the existing PromptBench React app or Express benchmark endpoints. It can run a Gemini request directly from the browser using a user-supplied API key, or it can be used as a prompt builder by copying the generated master prompt into another model.

## What Counts as Done

- Paste source text.
- Generate a generic summary.
- Generate at least three candidate hooks.
- Score hooks with structured JSON.
- Select one hook.
- Write a spotlight.
- Show source anchors.
- Show overclaim warnings.
- Save/export the run locally.
- Display summary vs spotlight side-by-side.

## Next Iteration

After enough runs are collected, add a review workflow that labels outputs as:

```json
{
  "document": "source text",
  "chosen": "high-quality spotlight",
  "rejected": "ordinary summary or weak spotlight",
  "review_notes": "why the chosen output is better"
}
```

Those pairs can later support preference tuning, DPO experiments, or prompt-regression benchmarks.
