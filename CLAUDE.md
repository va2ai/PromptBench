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
| `GET /api/health` | Liveness |

`evaluateAnswer()` in `server.ts` is the canonical scorer — required concepts (40), forbidden claims (20), citation validity (20), uncertainty (10), structure (10). If you change the rubric, the pre-calculated demo runs in `src/App.tsx` (`preCalculatedRuns`) also need updating, otherwise the canned demo will disagree with live runs.

### Spotlight Workbench dual engine

`POST /api/spotlight` chooses its LLM at request time:

- **Gemini path** (preferred): if `process.env.GEMINI_API_KEY` is set, uses `@google/genai` with `responseSchema` for structured output. Fast, cheap.
- **`claude -p` fallback**: spawned subprocess with `--output-format json --json-schema <schema> --append-system-prompt <single-shot directive> --disallowedTools <broad list>`. The single-shot directive and the wide disallow list are **load-bearing** — without them Claude Code's default system prompt treats the call as an interactive coding session, burns ~10 turns getting tool-denied, and returns an empty `result` with no `structured_output`. If you edit `callClaudePSpotlight`, do not remove either.
- The fallback also costs ~$0.15–0.50 per call (OAuth claude -p baseline + cache creation), so it's a "demo without setup" mode, not a production path. The error message thrown when `structured_output` is missing intentionally tells the caller to set `GEMINI_API_KEY`.

The spotlight prompt explicitly states that **the Workbench performs no network access**: a URL in `sourceText` is content to analyze, not a fetch instruction. Don't add fetch behavior without updating that contract.

### Frontend

- `src/App.tsx` (~2500 lines) is the single top-level component with four tabs: **Harness** (live benchmark), **Corpus** (edit cases/sources), **Report** (comparison_report.md), **Spotlight** (renders `SpotlightWorkbench.tsx`).
- `src/SpotlightWorkbench.tsx` is self-contained with its own palette and sub-tab system; it does not share styling tokens with `App.tsx`.
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

- `GEMINI_API_KEY` — needed for live Gemini calls in both the benchmark pipelines and the Spotlight Workbench. Absence is handled (demo fallbacks), but every live feature degrades.
- `PORT` — overrides the 3002 default.
- `.env` is gitignored; `.env.example` is the template.

## Conventions worth knowing

- `App.tsx` has many class strings referencing non-existent Tailwind shades (e.g. `text-slate-550`, `border-indigo-150`, `text-indigo-805`). They silently no-op. Don't waste time fixing them unless you're touching that line for another reason.
- Server hot-reload edits to `server.ts` cause Vite to print `(client) page reload server.ts`, but the **node process does not restart itself** — `tsx` only watches the TS loader. Kill and relaunch `npm run dev` when you change server code.
- This repo is checked in under `va2ai/PromptBench` on GitHub. Commits are made with `Co-Authored-By: Claude Opus 4.7 (1M context)`.
