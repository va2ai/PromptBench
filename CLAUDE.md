# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

PromptBench is a single-VM legal-grounding benchmark harness. It compares three agent architectures — **single-prompt**, **two-agent (drafter → grounder)**, and **three-agent (drafter → grounder → auditor/repair)** — on VA disability appeal questions, scoring answers on required-concept coverage, forbidden-claim avoidance, citation validity, uncertainty/evidence-gap handling, and structure. A separate **Spotlight Workbench** tab tests a different behavior: turning a source document into a faithful spotlight (selected hook + anchors + overclaim guardrails) instead of a generic summary.

## Commands

```bash
npm run dev            # tsx server.ts — serves API + React SPA on PORT (default 3002)
npm run build          # vite build + esbuild-bundle server.ts -> dist/server.cjs
npm start              # node dist/server.cjs (production)
npm run lint           # tsc --noEmit  (only typecheck; no test runner exists)
```

There is no test suite. The README's claim of port 3000 is stale — `server.ts` reads `PORT` env var and defaults to **3002**.

## Architecture

This is **one Express server** (`server.ts`, ~1600 lines) that does everything: pipeline orchestration, scoring, file I/O, the Spotlight endpoint, **and** serving the React SPA via Vite middleware in dev mode. There is no separate API service.

### Server topology

- `npm run dev` runs `tsx server.ts` directly. The server creates an explicit `http.createServer(app)` and passes it to Vite's `hmr.server` with `clientPort: 3002`, so **HMR rides on the same port as the API** instead of Vite's default 24678 (which isn't firewalled open on the VM). If you touch the dev-server setup at the bottom of `server.ts`, preserve this — splitting them re-breaks HMR over the public IP.
- In production (`NODE_ENV=production`), Vite is skipped and `dist/` static files are served.
- Frontend → backend is plain `fetch("/api/...")`. No proxy, no rewriting.

### Pipelines (`server.ts`)

The three pipelines and their evaluation live as inline functions in `server.ts` — there's no separate orchestration module yet. Key endpoints:

| Route | Purpose |
|---|---|
| `POST /api/run-single-pipeline` | Run one pipeline (`single` / `two` / `three`) for one test case |
| `POST /api/run-all-pipelines` | Sweep all three pipelines for one test case |
| `GET /api/stream-single-pipeline` | SSE variant of single-pipeline run (used for live logs in the UI) |
| `GET /api/runs` | List historical run JSONs from `outputs/runs/` |
| `POST /api/delete-all-runs` | Clear `outputs/runs/` |
| `GET /api/report` | Render the comparison report from `outputs/reports/comparison_report.md` |
| `GET /api/all-data`, `POST /api/save-cases`, `POST /api/save-sources` | CRUD over `data/test_cases.json` and `data/sources.json` |
| `GET /api/spotlight-engine` | Reports which engine `/api/spotlight` will use (Gemini if `GEMINI_API_KEY` set, else `claude -p`) |
| `POST /api/spotlight` | Generate a Spotlight Workbench run |
| `GET /api/groundlens-data`, `POST /api/groundlens-data` | Read / edit the Groundlens document + question set (`data/groundlens.json`) |
| `GET /api/groundlens-engine` | Reports which engine `/api/groundlens` will use (Gemini if `GEMINI_API_KEY`, else `claude -p`) |
| `POST /api/groundlens` | Run the Groundlens A/B grounding test |
| `GET /api/health` | Liveness |

`evaluateAnswer()` in `server.ts` is the canonical scorer — required concepts (40), forbidden claims (20), citation validity (20), uncertainty (10), structure (10). If you change the rubric, the pre-calculated demo runs in `src/App.tsx` (`preCalculatedRuns`) also need updating, otherwise the canned demo will disagree with live runs.

### Spotlight Workbench dual engine

`POST /api/spotlight` chooses its LLM at request time:

- **Gemini path** (preferred): a live Gemini backend is used whenever `hasGeminiBackend()` is true, which means **either** `GOOGLE_GENAI_USE_VERTEXAI=true` (Vertex AI via gcloud Application Default Credentials — no API key needed) **or** `process.env.GEMINI_API_KEY` is set (raw Developer API key). Both speak the same `@google/genai` client with `responseSchema` for structured output; the only difference is how the `GoogleGenAI` client is constructed near the top of `server.ts` (`useVertex` branch → `{vertexai:true, project, location}`, defaulting to `vaclaims-194006`/`us-central1`). Fast, cheap. `GET /api/spotlight-engine` / `/api/groundlens-engine` report which path is live.
- **`claude -p` fallback**: spawned subprocess with `--output-format json --json-schema <schema> --append-system-prompt <single-shot directive> --disallowedTools <broad list>`. The single-shot directive and the wide disallow list are **load-bearing** — without them Claude Code's default system prompt treats the call as an interactive coding session, burns ~10 turns getting tool-denied, and returns an empty `result` with no `structured_output`. If you edit `callClaudePSpotlight`, do not remove either.
- The fallback also costs ~$0.15–0.50 per call (OAuth claude -p baseline + cache creation), so it's a "demo without setup" mode, not a production path. The error message thrown when `structured_output` is missing intentionally tells the caller to set `GEMINI_API_KEY`.

The spotlight prompt explicitly states that **the Workbench performs no network access**: a URL in `sourceText` is content to analyze, not a fetch instruction. Don't add fetch behavior without updating that contract.

### Groundlens A/B grounding test

`POST /api/groundlens` is a **real** end-to-end test, not a canned view. Over one source document (`data/groundlens.json`) it: (1) does deterministic **TF-IDF top-K retrieval** per question, (2) runs the **same engine twice** with two prompt regimes — `calibrated` (strict grounding) vs `permissive` (fills gaps with confident specifics) — over identical evidence, then (3) scores each answer with the **SGI**.

- The variable under test is the **prompt/behavior, not the model** — both runs use the same engine (Gemini — Vertex or API key — or the `claude -p` fallback), so it's apples-to-apples. It reuses the same dual-engine path and the load-bearing `callClaudePSpotlight` fallback as Spotlight (one LLM call per regime answers all questions via a structured schema).
- **`src/groundlens/sgi.ts`** is the canonical scorer: pure, deterministic, no LLM-as-judge. SGI = IDF-weighted token coverage of the answer against its retrieved evidence, aggregated with a **geometric mean** (so one fabricated claim tanks the score), normalized by `TAU` (the grounding fraction that defines SGI = 1.0). Verdicts: SGI ≥ 1.0 trusted, ≥ 0.85 review, else flagged. Fabricated specifics (invented numbers/validators/standards) carry max IDF and are never in evidence → they drag SGI down. If you change `TAU` or the thresholds, the demo report in `GroundlensMetrics.tsx` (`DEMO_REPORT`) is illustrative only and won't recompute.
- The seed `data/groundlens.json` document answers every question in *general* terms but deliberately omits specific figures/validators/scenarios, so the permissive regime's fabrications are what the geometry catches.

### Frontend

- `src/App.tsx` (~3000 lines) is the single top-level component. There are **three top-level tabs** (`TOP_TABS`): **Harness**, **Spotlight** (renders `SpotlightWorkbench.tsx`), **Groundlens** (renders `GroundlensMetrics.tsx`). Harness is itself a group (`HARNESS_GROUP` / `HARNESS_SUBTABS`) with three **subtabs**: **Benchmark** (live benchmark, internal id `"dashboard"`), **Corpus** (`"files"`, edit cases/sources), **Report** (comparison_report.md). The `TabId` union is the flat set `"dashboard" | "files" | "report" | "spotlight" | "groundlens"`; entering the Harness group from outside lands on its default subtab `"dashboard"`. Note the id/label mismatch: id `"dashboard"` is labelled "Benchmark" and id `"files"` is labelled "Corpus". Within the Benchmark view there's a further `observabilitySubTab` (grounded / trace / matrix / prompts).
- `src/SpotlightWorkbench.tsx` and `src/GroundlensMetrics.tsx` are each self-contained with their own palette; they do not share styling tokens with `App.tsx`. `GroundlensMetrics.tsx` shows a worked `DEMO_REPORT` until a live run lands (or when no key is configured), edits the corpus inline, and expands each question to show the real answers + retrieved evidence.
- API-key-missing flow: backend throws `"GEMINI_API_KEY is missing..."`; frontend's `runFullBenchmark` / `runSingleCasePipeline` catches the 500, sets `apiKeyMissing=true`, shows the notice banner, and falls back to `preCalculatedRuns`. The console 500s look scary but the UX is by design.

### Design tokens (`src/index.css`)

`index.css` does two non-obvious things via `@theme inline`:

1. **Remaps Tailwind's `indigo` palette in place** to an ink/graphite ramp, and `slate` to warm stone. Hundreds of `bg-indigo-*` / `text-indigo-*` classes across `App.tsx` become a restrained ink scheme without JSX churn. If you want a different accent, change the variables here, not the classes.
2. **Globally neutralizes `animate-pulse`, `animate-ping`, `animate-bounce`, and Material-style shadows.** This is intentional restraint; re-enabling them undoes the editorial aesthetic.

### Data and persistence

- `data/test_cases.json` and `data/sources.json` are user-editable seed data. `server.ts` seeds them with defaults on first boot if missing.
- `outputs/runs/<id>.json` — every benchmark run is written here. `GET /api/runs` enumerates them.
- `outputs/reports/comparison_report.md` — markdown summary regenerated by the sweep endpoints.
- No database. Everything is the filesystem.

### Other directories

- `agent-grounding-mvp/` — original Python reference implementation (`app/main.py` + `requirements.txt`). The TypeScript server in this repo is the port; the Python tree is kept as reference, not run.
- `src/agentic/` — recently added scaffolding for a model-agnostic LLM provider contract (`llm/provider.ts`) and shared agentic types. Not yet wired into the live pipelines in `server.ts`.
- `public/spotlight-workbench.html` — earlier standalone HTML prototype of the Spotlight Workbench. The live version is the React tab; the HTML file is preserved as a reference.
- `docs/spotlight-workbench.md` — full spec for the Spotlight Workbench output contract and rationale.

## Environment

- `GEMINI_API_KEY` — Developer-API key for live Gemini calls in both the benchmark pipelines and the Spotlight Workbench. Absence is handled (demo fallbacks), but every live feature degrades.
- `GOOGLE_GENAI_USE_VERTEXAI=true` — alternative Gemini auth: route calls through Vertex AI using gcloud **Application Default Credentials** (the VM's service account, or `gcloud auth application-default login` in dev) instead of an API key. With it set, `GEMINI_API_KEY` is not required. `GOOGLE_CLOUD_PROJECT` / `GOOGLE_CLOUD_LOCATION` tune the Vertex target (default `vaclaims-194006` / `us-central1`).
- `PORT` — overrides the 3002 default.
- `.env` is gitignored; `.env.example` is the template.

## Conventions worth knowing

- `App.tsx` has many class strings referencing non-existent Tailwind shades (e.g. `text-slate-550`, `border-indigo-150`, `text-indigo-805`). They silently no-op. Don't waste time fixing them unless you're touching that line for another reason.
- Server hot-reload edits to `server.ts` cause Vite to print `(client) page reload server.ts`, but the **node process does not restart itself** — `tsx` only watches the TS loader. Kill and relaunch `npm run dev` when you change server code.
- This repo is checked in under `va2ai/PromptBench` on GitHub. Commits are made with `Co-Authored-By: Claude Opus 4.7 (1M context)`.
