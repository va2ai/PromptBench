<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# PromptBench

This repo contains the PromptBench app for comparing agent/prompt architectures on grounded legal-tech outputs.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key.
3. Run the app:
   `npm run dev`

## Spotlight Workbench MVP

A standalone Spotlight Workbench prototype has been added at:

```text
public/spotlight-workbench.html
```

Open it from the local dev server at:

```text
http://localhost:3000/spotlight-workbench.html
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
