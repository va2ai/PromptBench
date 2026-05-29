# Model-Provider Toggle — Design

**Date:** 2026-05-29
**Status:** Approved (design); implementation pending
**Scope:** Add a user-facing toggle that selects which LLM backend — **Gemini** or **Claude** — runs every live feature: the three-architecture Harness benchmark, the Spotlight Workbench, and the Groundlens A/B test.

## Goal

Today the server hard-prefers Gemini (`gemini-3.1-flash`) and only uses `claude -p` as a no-key fallback for Spotlight/Groundlens; the benchmark pipelines have no Claude path at all. This feature makes Claude a **first-class, explicitly selectable provider** across all three features, with Gemini as the other choice.

## Decisions (locked during brainstorming)

| Question | Decision |
|---|---|
| What the toggle switches | Gemini vs Claude provider |
| How Claude is called | `claude -p` subprocess (reuse existing `callClaudePSpotlight`); **not** the Anthropic API |
| Feature reach | All three features, one app-wide toggle |
| Architecture | **A** — a thin per-call dispatch helper (not the `src/agentic/llm/provider.ts` class abstraction) |
| Streaming view with Claude | Degrade to non-streamed (single final SSE event) |

## Design

### 1. Provider selection (data flow)

A `provider: "gemini" | "claude"` field rides **per-request**, mirroring the existing `model` field. No server-side mutable provider state — a run is fully described by its request, preserving reproducibility and concurrent-user safety.

Carried in:
- body of `POST /api/run-single-pipeline`, `/api/run-all-pipelines`, `/api/spotlight`, `/api/groundlens`
- query string of `GET /api/stream-single-pipeline`

**Default (field omitted):** preserve current behavior — `gemini` when `isGeminiAvailable()` is true (Vertex via ADC or `GEMINI_API_KEY`), else `claude`. Existing callers and previously-saved runs keep their meaning.

**Unavailable handling:**
- `provider: "gemini"` with no key/Vertex → existing `"GEMINI_API_KEY is missing…"` error path. The frontend already catches the 500, sets `apiKeyMissing`, shows the banner, and falls back to `preCalculatedRuns`.
- `provider: "claude"` → always available (OAuth `claude -p` is present on the VM).

### 2. Backend: one dispatch helper (Architecture A)

New internal function in `server.ts`:

```ts
generateStructured({ provider, model, prompt, schema }):
  Promise<{ data: unknown; prompt_tokens: number; output_tokens: number }>
```

- `provider === "gemini"` → wraps existing `generateContentWithRetry` (keeps the global rate-limit queue and `responseSchema`). Returns parsed `response.text` as `data` and maps `usageMetadata`.
- `provider === "claude"` → wraps existing `callClaudePSpotlight(prompt, schema)`. Returns `structured_output` as `data` and maps its usage.

**Schema twins.** The 5 benchmark agent calls inline a Gemini `Type.*` `responseSchema`:
`executeSingleAgent`, two-agent (retriever + reasoner), three-agent (validator + repair).
Each needs a **plain-JSON-Schema twin** (`{ type: "object", properties, required }`) so `callClaudePSpotlight`'s `--json-schema` can consume it. The Gemini `Type.OBJECT`/`Type.STRING`/`Type.ARRAY` enums map 1:1 to `"object"`/`"string"`/`"array"`. These twins live next to each agent (or in a small shared map keyed by agent stage).

Spotlight and both Groundlens calls already pass plain JSON schemas to `callClaudePSpotlight`, so they only need the `provider` argument threaded through `generateStructured`.

**Call sites refactored to use `generateStructured` (~8):** 5 benchmark agent stages + Spotlight + Groundlens answer + Groundlens question-gen.

### 3. Streaming endpoint (`GET /api/stream-single-pipeline`)

When `provider === "claude"`: run the pipeline normally and emit a **single final SSE result event** (retaining the existing per-stage log lines where cheap) instead of token-by-token streaming, because `claude -p` structured output is not token-streamable here. The Gemini streaming path (`generateContentStream`) is unchanged. The UI surfaces a note that live token streaming is Gemini-only when Claude is selected.

### 4. Frontend toggle

- **Ownership:** a single app-wide `provider` state lifted into `App.tsx`. `SpotlightWorkbench.tsx` and `GroundlensMetrics.tsx` receive it as a prop (they are rendered by `App.tsx`).
- **Persistence:** `localStorage`, so the choice survives reloads.
- **Placement:** top nav, governing all three top-level tabs.
- **Availability:** new `GET /api/providers` returns `{ gemini: { available, source }, claude: { available } }`. The toggle disables/annotates the Gemini option when no key/Vertex is configured.
- The existing `/api/spotlight-engine` + `/api/groundlens-engine` endpoints stay; they now report the **default**, while the explicit toggle overrides per request.

### 5. Cost/usage parity

`callClaudePSpotlight` already returns usage. Map it to the same `prompt_tokens` / `output_tokens` shape the run JSON and the matrix/observability views expect, so the comparison UI renders identically regardless of provider.

## Out of scope (YAGNI)

- Anthropic API transport (we chose `claude -p`).
- The `src/agentic/llm/provider.ts` class abstraction + registry (Architecture B).
- OpenAI or any third provider.
- Per-feature independent toggles (one global toggle only).

## Risks / notes

- **Cost & latency:** a benchmark sweep on `claude -p` fires several subprocess calls per run (~$0.15–0.50 and seconds each). This is acceptable for a demo/comparison harness; the UI should make the cost implication of selecting Claude visible.
- **`preCalculatedRuns` parity:** the canned demo runs in `src/App.tsx` are Gemini-shaped; selecting Claude and hitting the unavailable-Gemini fallback still lands on those. No rubric change here, so `preCalculatedRuns` need not be regenerated.
- **No test suite exists** — verification is manual (run each feature under each provider; confirm `/api/providers` availability gating).
