# Model-Provider Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-request `provider: "gemini" | "claude"` field, surfaced as one app-wide UI toggle, that selects which LLM backend runs the Harness benchmark, Spotlight, and Groundlens.

**Architecture:** A single backend dispatch helper `generateStructured({provider, model, prompt, schema})` routes each structured call to either the existing Gemini `generateContentWithRetry` or the existing `callClaudePSpotlight` (`claude -p`) path. Each call site declares **one plain JSON Schema**; a recursive `toGeminiSchema()` converter adapts it to `@google/genai`'s `Type.*` form, so there is no duplicated schema. The frontend owns a `provider` state in `App.tsx`, persists it to `localStorage`, sends it on every request, and gates the Gemini option on a new `GET /api/providers` availability endpoint.

**Tech Stack:** TypeScript, Express, `@google/genai`, React 19, `claude -p` subprocess.

**Validation note:** This repo has **no test runner** — `npm run lint` is `tsc --noEmit`. Validation in each task is therefore (a) `npm run lint` for type safety and (b) targeted `curl` / browser checks against a running `npm run dev` server. Spec: `docs/superpowers/specs/2026-05-29-model-provider-toggle-design.md`.

---

## File Structure

- **Modify `server.ts`** — add `Provider` type, `toGeminiSchema()`, `generateStructured()`, `resolveProvider()`; convert the 5 benchmark agent schemas to plain JSON Schema and route them + Spotlight + Groundlens through `generateStructured`; thread `provider` through 5 request handlers; add `GET /api/providers`; degrade the stream endpoint under Claude.
- **Modify `src/App.tsx`** — `provider` state + `localStorage` + nav toggle; pass to child tabs; include `provider` in all `fetch` bodies/queries; fetch `/api/providers` to gate the Gemini option; show streaming-note under Claude.
- **Modify `src/SpotlightWorkbench.tsx`** — accept `provider` prop, send it in its `/api/spotlight` call.
- **Modify `src/GroundlensMetrics.tsx`** — accept `provider` prop, send it in its `/api/groundlens` call.
- **Modify `CLAUDE.md`** — document the toggle, the `provider` field, and `/api/providers`.

> Convention: `server.ts` is one large file by design (see CLAUDE.md); new helpers go near the existing Gemini client/`callClaudePSpotlight` code rather than into new modules, matching the established pattern. The `src/agentic/llm/provider.ts` abstraction stays untouched (explicitly out of scope).

---

## Task 1: Backend dispatch helpers

**Files:**
- Modify: `server.ts` (add helpers immediately after `callClaudePSpotlight`'s definition near line 1542; `toGeminiSchema`/`generateStructured` reference `Type`, `generateContentWithRetry`, `callClaudePSpotlight`, `getGeminiClient`, `isGeminiAvailable`, all already in scope)

- [ ] **Step 1: Add the `Provider` type and `resolveProvider` helper**

Add near the top of `server.ts`, just after the `isGeminiAvailable()` function (around line 55):

```ts
export type Provider = "gemini" | "claude";

// Resolve the effective provider for a request. Explicit choice wins; when omitted
// we preserve the historical default: Gemini if a live backend is configured, else claude -p.
function resolveProvider(requested?: unknown): Provider {
  if (requested === "gemini" || requested === "claude") return requested;
  return isGeminiAvailable() ? "gemini" : "claude";
}
```

- [ ] **Step 2: Add the `toGeminiSchema` converter**

Add just before `callClaudePSpotlight` (around line 1541). It maps a plain JSON Schema to the `@google/genai` `Type.*` shape that `responseSchema` expects:

```ts
// Convert a plain JSON Schema (the single source of truth at each call site) into the
// @google/genai responseSchema form. Lets one schema feed both the Gemini path and the
// claude -p path (which consumes plain JSON Schema directly).
function toGeminiSchema(s: any): any {
  const typeMap: Record<string, any> = {
    object: Type.OBJECT,
    string: Type.STRING,
    array: Type.ARRAY,
    number: Type.NUMBER,
    integer: Type.INTEGER,
    boolean: Type.BOOLEAN,
  };
  const out: any = { type: typeMap[s.type] ?? Type.STRING };
  if (s.description) out.description = s.description;
  if (s.properties) {
    out.properties = {};
    for (const [k, v] of Object.entries(s.properties)) out.properties[k] = toGeminiSchema(v);
  }
  if (s.required) out.required = s.required;
  if (s.items) out.items = toGeminiSchema(s.items);
  return out;
}
```

- [ ] **Step 3: Add the `generateStructured` dispatch helper**

Add immediately after `toGeminiSchema`:

```ts
// Single entry point for one structured LLM call. Routes to Gemini or claude -p by provider
// and returns a uniform shape so every call site is provider-agnostic.
async function generateStructured(opts: {
  provider: Provider;
  model: string;
  prompt: string;
  schema: any; // plain JSON Schema
}): Promise<{ data: any; prompt_tokens: number; output_tokens: number }> {
  if (opts.provider === "claude") {
    const { parsed, usage } = await callClaudePSpotlight(opts.prompt, opts.schema);
    return { data: parsed, prompt_tokens: usage.input_tokens, output_tokens: usage.output_tokens };
  }
  // Gemini path. getGeminiClient() throws the existing "GEMINI_API_KEY is missing" error
  // when no backend is configured, preserving the current key-missing UX.
  getGeminiClient();
  const response = await generateContentWithRetry({
    model: opts.model,
    contents: opts.prompt,
    config: { responseMimeType: "application/json", responseSchema: toGeminiSchema(opts.schema) },
  });
  return {
    data: JSON.parse(response.text || "{}"),
    prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
    output_tokens: response.usageMetadata?.candidatesTokenCount || 0,
  };
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run lint`
Expected: PASS (no new errors). The helpers are not yet called, so this only proves they typecheck.

- [ ] **Step 5: Commit**

```bash
git add server.ts
git commit -m "feat(provider): add generateStructured dispatch helper + provider resolution"
```

---

## Task 2: Route benchmark agents through `generateStructured`

**Files:**
- Modify: `server.ts` — `executeSingleAgent` (~592), `executeTwoAgent` (~643), `executeThreeAgent` (~794)

Each agent currently: gets the Gemini client, builds a prompt, calls `generateContentWithRetry` with an inline `Type.*` `responseSchema`, then `JSON.parse(response.text)`. Replace each with a plain JSON Schema + `generateStructured`, and thread a `provider` parameter.

- [ ] **Step 1: Convert `executeSingleAgent`**

Change the signature to add `provider` and replace the body's call. Signature (line ~592) becomes:

```ts
async function executeSingleAgent(question: string, sources: any[], provider: Provider = "gemini", modelName = "gemini-3.1-flash", customPrompt?: string): Promise<{
  answer: string;
  citations_used: string[];
  prompt_tokens: number;
  output_tokens: number;
}> {
```

Delete the `const client = getGeminiClient();` line and the entire `const response = await generateContentWithRetry({...});` block plus the `const parsed = JSON.parse(...)` line, replacing them with:

```ts
  const { data: parsed, prompt_tokens, output_tokens } = await generateStructured({
    provider,
    model: modelName,
    prompt,
    schema: {
      type: "object",
      properties: {
        answer: { type: "string" },
        citations_used: { type: "array", items: { type: "string" } },
      },
      required: ["answer", "citations_used"],
    },
  });
  return {
    answer: parsed.answer || "",
    citations_used: parsed.citations_used || [],
    prompt_tokens,
    output_tokens,
  };
```

- [ ] **Step 2: Convert `executeTwoAgent`**

Add `provider: Provider = "gemini"` as the third parameter (before `modelName`). Remove its `const client = getGeminiClient();`. Replace the **retriever** `generateContentWithRetry({...})` + its `JSON.parse` with:

```ts
  const retrieval = await generateStructured({
    provider,
    model: modelName,
    prompt: retrievalPrompt,
    schema: {
      type: "object",
      properties: {
        evidence_cards: {
          type: "array",
          items: {
            type: "object",
            properties: {
              source_id: { type: "string" },
              citation: { type: "string" },
              relevance: { type: "string", description: "high, medium, or low" },
              excerpt: { type: "string" },
              why_it_matters: { type: "string" },
            },
            required: ["source_id", "citation", "relevance", "excerpt", "why_it_matters"],
          },
        },
      },
      required: ["evidence_cards"],
    },
  });
  const evidenceCards = retrieval.data.evidence_cards || [];
```

Replace the **reasoner** `generateContentWithRetry({...})` + its `JSON.parse` with a `generateStructured` call using the reasoner's existing schema rewritten in plain JSON Schema (`answer: string`, `citations_used: string[]`, `missing_evidence: string[]` — confirm field names against lines ~713-770 before writing). Sum tokens from both calls:

```ts
  // (reasoner call returns `const reasoning = await generateStructured({...})`)
  return {
    evidence_cards: evidenceCards,
    answer: reasoning.data.answer || "",
    citations_used: reasoning.data.citations_used || [],
    missing_evidence: reasoning.data.missing_evidence || [],
    prompt_tokens: retrieval.prompt_tokens + reasoning.prompt_tokens,
    output_tokens: retrieval.output_tokens + reasoning.output_tokens,
  };
```

- [ ] **Step 3: Convert `executeThreeAgent`**

Add `provider: Provider = "gemini"` as the third parameter. `executeThreeAgent` internally calls the validator and repair stages (lines ~838, ~898) — and may reuse `executeSingleAgent`/`executeTwoAgent` for the draft. For each internal `generateContentWithRetry` (validator, repair), convert to `generateStructured` exactly as above, transcribing each stage's existing `Type.*` schema into plain JSON Schema. For any internal call to `executeSingleAgent`/`executeTwoAgent`, pass `provider` through. Sum tokens across all stages as the function already does.

- [ ] **Step 4: Typecheck**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 5: Runtime check — Gemini path unchanged**

Start the dev server in one shell: `npm run dev` (port 3002). With a Gemini backend configured (`GEMINI_API_KEY` or `GOOGLE_GENAI_USE_VERTEXAI=true`):

```bash
curl -s -X POST http://localhost:3002/api/run-single-pipeline \
  -H 'Content-Type: application/json' \
  -d '{"caseId":"<an id from data/test_cases.json>","pipeline":"single","provider":"gemini"}' | head -c 400
```
Expected: a JSON run object with a non-empty `answer` and a numeric score — identical shape to before this task.

- [ ] **Step 6: Runtime check — Claude path**

```bash
curl -s -X POST http://localhost:3002/api/run-single-pipeline \
  -H 'Content-Type: application/json' \
  -d '{"caseId":"<same id>","pipeline":"single","provider":"claude"}' | head -c 400
```
Expected: a JSON run object with a non-empty `answer` (this call spawns `claude -p` and may take 20–60s). If it errors with "no structured_output", that is a `claude -p` environment issue, not a code defect — note it and continue.

- [ ] **Step 7: Commit**

```bash
git add server.ts
git commit -m "feat(provider): route benchmark agents through generateStructured (plain JSON schemas)"
```

---

## Task 3: Thread `provider` through request handlers + Spotlight/Groundlens + streaming

**Files:**
- Modify: `server.ts` — handlers at lines ~1107 (stream), ~1153 (run-single), ~1280 (run-all), ~1652 (spotlight), ~2040 (groundlens)

- [ ] **Step 1: `POST /api/run-single-pipeline` (~1153)**

In the handler, after the existing `const { caseId, pipeline, model } = req.body;`, add `provider`:

```ts
  const { caseId, pipeline, model, provider } = req.body;
  const chosenProvider = resolveProvider(provider);
  const modelName = model || "gemini-3.1-flash";
```
Pass `chosenProvider` into each `executeSingleAgent/executeTwoAgent/executeThreeAgent` call in this handler, in the new third-parameter position: e.g. `executeSingleAgent(question, sources, chosenProvider, modelName)`. Persist `provider: chosenProvider` into the saved run JSON object so historical runs record which backend produced them.

- [ ] **Step 2: `POST /api/run-all-pipelines` (~1280)**

Same pattern: destructure `provider` from `req.body`, compute `const chosenProvider = resolveProvider(provider);`, pass it as the third argument to all three `execute*Agent` calls, and record `provider: chosenProvider` on each saved run.

- [ ] **Step 3: `GET /api/stream-single-pipeline` (~1107) — degrade under Claude**

Destructure `provider` from `req.query`, compute `const chosenProvider = resolveProvider(provider);`. The existing Gemini branch uses `client.models.generateContentStream` for live tokens — keep it **only when `chosenProvider === "gemini"`**. When `chosenProvider === "claude"`:
- Do **not** call `generateContentStream`.
- Run the pipeline via the same `execute*Agent(question, sources, "claude", modelName)` path used by the non-streaming endpoint.
- Emit the existing per-stage SSE log lines if present, then a single final `data:` event carrying the full result, then close the stream.

```ts
  if (chosenProvider === "claude") {
    res.write(`data: ${JSON.stringify({ type: "log", message: "Running via claude -p (live token streaming is Gemini-only)..." })}\n\n`);
    const result = await runPipelineForStream(question, sources, "claude", modelName, pipeline); // use the existing pipeline runner the handler already calls
    res.write(`data: ${JSON.stringify({ type: "result", result })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
    return;
  }
```
> Match the actual SSE event names already used in this handler (inspect lines ~1107-1152 for the exact `type` strings the frontend listens for) so the frontend's existing `onmessage` parsing handles the final event unchanged.

- [ ] **Step 4: `POST /api/spotlight` (~1652) and `POST /api/groundlens` (~2040)**

These already branch on `isGeminiAvailable()` to choose Gemini vs `callClaudePSpotlight`. Replace that internal branch with `generateStructured`:
- Destructure `provider` from `req.body`; `const chosenProvider = resolveProvider(provider);`.
- Replace each `if (isGeminiAvailable()) { ...gemini... } else { ...callClaudePSpotlight... }` block with a single `await generateStructured({ provider: chosenProvider, model: modelName, prompt, schema })` call (the schemas `spotlightJsonSchema`, `groundlensAnswerSchema`, `groundlensQuestionGenSchema` are already plain JSON Schema — pass them straight through). Map the returned `data` where the code previously used the parsed object.

- [ ] **Step 5: Typecheck + runtime**

Run: `npm run lint` (expect PASS), then with the dev server running:
```bash
curl -s -N "http://localhost:3002/api/stream-single-pipeline?caseId=<id>&pipeline=single&provider=claude" | head -c 300
curl -s -X POST http://localhost:3002/api/spotlight -H 'Content-Type: application/json' -d '{"sourceText":"Short demo text about a benefits decision.","provider":"gemini"}' | head -c 300
```
Expected: the stream emits a final result event then closes; the spotlight call returns a structured spotlight JSON.

- [ ] **Step 6: Commit**

```bash
git add server.ts
git commit -m "feat(provider): thread provider through all endpoints; stream degrades under Claude"
```

---

## Task 4: `GET /api/providers` availability endpoint

**Files:**
- Modify: `server.ts` — add next to `/api/spotlight-engine` (~1431)

- [ ] **Step 1: Add the endpoint**

```ts
// Report provider availability so the UI can enable/annotate the toggle.
app.get("/api/providers", (_req, res) => {
  const geminiSource = useVertex
    ? `Vertex AI (ADC: ${vertexProject}/${vertexLocation})`
    : process.env.GEMINI_API_KEY
      ? "GEMINI_API_KEY"
      : null;
  res.json({
    default: isGeminiAvailable() ? "gemini" : "claude",
    gemini: { available: isGeminiAvailable(), source: geminiSource },
    claude: { available: true, source: "claude -p (OAuth)" },
  });
});
```

- [ ] **Step 2: Runtime check**

Run: `curl -s http://localhost:3002/api/providers`
Expected: JSON with `default`, `gemini.available` (true iff a key/Vertex is set), and `claude.available: true`.

- [ ] **Step 3: Commit**

```bash
git add server.ts
git commit -m "feat(provider): add GET /api/providers availability endpoint"
```

---

## Task 5: Frontend toggle

**Files:**
- Modify: `src/App.tsx` (provider state, nav toggle, propagate to fetches + child tabs)
- Modify: `src/SpotlightWorkbench.tsx` (accept + send `provider`)
- Modify: `src/GroundlensMetrics.tsx` (accept + send `provider`)

- [ ] **Step 1: Add provider state in `App.tsx`**

Near the other `useState` hooks in the top component (around line 322, by `activeTab`), add:

```tsx
const [provider, setProvider] = useState<"gemini" | "claude">(
  () => (localStorage.getItem("pb.provider") as "gemini" | "claude") || "gemini"
);
const [providerInfo, setProviderInfo] = useState<{ gemini: { available: boolean }; claude: { available: boolean } } | null>(null);

useEffect(() => { localStorage.setItem("pb.provider", provider); }, [provider]);
useEffect(() => {
  fetch("/api/providers").then((r) => r.json()).then(setProviderInfo).catch(() => setProviderInfo(null));
}, []);
```

- [ ] **Step 2: Render the toggle in the top nav**

In the `TOP_TABS` nav row (around line 711-768), add a control on the right side:

```tsx
<div className="flex items-center gap-2 text-xs">
  <span style={{ color: "var(--ink-soft)" }}>Provider</span>
  <button
    onClick={() => setProvider("gemini")}
    disabled={providerInfo ? !providerInfo.gemini.available : false}
    className={provider === "gemini" ? "px-2 py-1 rounded bg-indigo-600 text-white" : "px-2 py-1 rounded"}
  >Gemini</button>
  <button
    onClick={() => setProvider("claude")}
    className={provider === "claude" ? "px-2 py-1 rounded bg-indigo-600 text-white" : "px-2 py-1 rounded"}
  >Claude</button>
</div>
```
If `providerInfo.gemini.available` is false, the Gemini button is disabled (title/tooltip: "No GEMINI_API_KEY or Vertex configured").

- [ ] **Step 3: Send `provider` on every benchmark request**

In `runFullBenchmark` and `runSingleCasePipeline` (and any other `fetch("/api/run-*"...)` / stream URL builder in `App.tsx`), add `provider` to the JSON body, and append `&provider=${provider}` to the `EventSource`/stream URL. Example for a POST:

```tsx
body: JSON.stringify({ caseId, pipeline, model, provider }),
```
For the stream view, when `provider === "claude"`, render a small note: "Live token streaming is Gemini-only; Claude shows the final result."

- [ ] **Step 4: Pass `provider` to child tabs**

Where `App.tsx` renders the tabs (around lines 797+), pass the prop:

```tsx
{activeTab === "spotlight" && <SpotlightWorkbench provider={provider} />}
{activeTab === "groundlens" && <GroundlensMetrics provider={provider} />}
```

- [ ] **Step 5: Consume `provider` in the child components**

In `src/SpotlightWorkbench.tsx`, add `provider` to its props type and include it in the `/api/spotlight` fetch body:
```tsx
export default function SpotlightWorkbench({ provider }: { provider: "gemini" | "claude" }) { /* ... */ }
// in the fetch: body: JSON.stringify({ ...existingFields, provider }),
```
Do the same in `src/GroundlensMetrics.tsx` for its `/api/groundlens` fetch.

- [ ] **Step 6: Typecheck + build**

Run: `npm run lint && npm run build`
Expected: both PASS (lint clean; vite build produces `dist/assets/*`).

- [ ] **Step 7: Manual UI check**

With `npm run dev` running, open the app, flip the toggle to Claude, run a single benchmark case, confirm it completes and the run is labelled/works; flip to Gemini, confirm streaming still shows live logs. Visit Spotlight and Groundlens under each provider.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/SpotlightWorkbench.tsx src/GroundlensMetrics.tsx
git commit -m "feat(provider): app-wide Gemini/Claude toggle wired to all three tabs"
```

---

## Task 6: Docs + final integration verification

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Document the feature**

In `CLAUDE.md`, update the "Spotlight Workbench dual engine" / endpoints sections to note: (a) all live endpoints accept a `provider: "gemini" | "claude"` field, (b) the dispatch goes through `generateStructured()`, (c) `GET /api/providers` reports availability, (d) the stream endpoint degrades to a single final event under Claude. Keep it concise — one short paragraph + the endpoint-table row for `/api/providers`.

- [ ] **Step 2: Full sweep, both providers**

With the dev server running and a Gemini backend configured, run `/api/run-all-pipelines` once with `"provider":"gemini"` and once with `"provider":"claude"`; confirm both produce three runs each in `outputs/runs/` and the report renders.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document provider toggle, generateStructured, and /api/providers"
```

- [ ] **Step 4: Push + open PR**

```bash
git push -u origin claude/model-provider-toggle
gh pr create --title "Add Gemini/Claude model-provider toggle" --body "Implements docs/superpowers/specs/2026-05-29-model-provider-toggle-design.md. Per-request provider field routed via generateStructured(); app-wide toggle; /api/providers availability; stream degrades under Claude."
```

---

## Self-Review

**Spec coverage:**
- §1 Provider selection (per-request field, default, unavailable handling) → Task 1 (`resolveProvider`, Gemini key-missing preserved), Task 3 (handlers destructure `provider`). ✓
- §2 Dispatch helper + schema twins → Task 1 (`generateStructured`/`toGeminiSchema`), Task 2 (benchmark schemas), Task 3 (Spotlight/Groundlens). ✓ (Refinement: single plain schema + converter instead of duplicate twins — noted in plan header.)
- §3 Streaming degrade → Task 3 Step 3. ✓
- §4 Frontend toggle (App-owned, localStorage, nav, availability gating) → Task 5. ✓
- §5 Cost/usage parity → Task 1 (`generateStructured` maps `input_tokens`/`output_tokens`), Task 2 (token summing preserved). ✓
- `/api/providers` → Task 4. ✓
- Out-of-scope items (Anthropic API, provider.ts abstraction, OpenAI, per-feature toggles) → not introduced. ✓

**Placeholder scan:** Two intentional "inspect the exact existing code before transcribing" notes remain (Task 2 reasoner schema field names; Task 3 SSE event-name matching). These are not placeholders for *plan* content — they instruct verifying against existing code whose exact bytes the plan should not guess. All code the plan introduces is fully specified.

**Type consistency:** `Provider` type, `generateStructured` return keys (`data`/`prompt_tokens`/`output_tokens`), `resolveProvider` name, and the `provider` parameter position (third arg, before `modelName`) are used consistently across Tasks 1-3 and the frontend prop type `"gemini" | "claude"` matches across App/Spotlight/Groundlens.
