# PromptBench

PromptBench is a single-VM legal-grounding benchmark harness. It compares three
agent architectures — single-prompt, two-agent (drafter → grounder), and
three-agent (drafter → grounder → auditor/repair) — on VA disability appeal
questions, scoring answers on required-concept coverage, forbidden-claim
avoidance, citation validity, uncertainty handling, and structure. A separate
Spotlight Workbench turns a source document into a faithful spotlight, and a
Groundlens tab runs a deterministic A/B grounding test (calibrated vs permissive
prompting) scored by a Strict Grounding Index.

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set your `GEMINI_API_KEY`. This is optional —
   without a key the app falls back to pre-computed demo runs.
3. Run the app:
   `npm run dev` — serves the API + SPA on `http://localhost:3002`.

## Spotlight Workbench MVP

A standalone Spotlight Workbench prototype has been added at:

```text
public/spotlight-workbench.html
```

Open it from the local dev server at:

```text
http://localhost:3002/spotlight-workbench.html
```

The workbench tests whether an LLM can produce a **spotlight** instead of a generic summary:

- generic summary baseline
- candidate spotlight hooks
- hook scoring
- selected hook
- final spotlight
- source anchors
- overclaim warnings
- faithfulness check
- summary vs. spotlight comparison
- local JSON export for later eval/training pairs

The implementation is intentionally self-contained so it does not disrupt the existing React harness or Express benchmark endpoints.

Full spec:

```text
docs/spotlight-workbench.md
```
