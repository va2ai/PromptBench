import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ShieldCheck,
  Eye,
  Flag,
  Play,
  Loader2,
  SlidersHorizontal,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  AlertCircle,
  Sparkles,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Groundlens — real model-risk Q&A A/B test.
//
// One source document, two LLM *behaviors* over identical TF-IDF-retrieved
// evidence (calibrated vs permissive prompt, same engine), each answer scored
// by a deterministic geometric grounder (SGI) into a trust/review/flag verdict.
// The backend (/api/groundlens) does the retrieval + generation + scoring; this
// tab edits the corpus, kicks the run, and renders the real results. The DEMO
// report is shown until a real run lands (or when no GEMINI_API_KEY is set).
//
// Styled to match the rest of the site: the warm-paper editorial light theme
// from index.css (white cards on #fafaf7 paper, ink/stone text, one deep-blue
// accent, sans body with mono reserved for labels/numbers).
// ---------------------------------------------------------------------------

type Verdict = "trusted" | "review" | "flagged";

type SentenceSupport = { sentence: string; support: number };
type RunResult = {
  regime: string;
  label: string;
  model: string;
  answer: string;
  sgi: number;
  grounding: number;
  verdict: Verdict;
  sentenceSupport: SentenceSupport[];
};
type EvidenceChunk = { index: number; score: number; text: string };
type QuestionResult = {
  id: string;
  question: string;
  evidence: EvidenceChunk[];
  runs: RunResult[];
  note?: { text: string; tone: string };
};
type SummaryRow = { label: string; trusted: number; review: number; flagged: number };

type GroundlensReport = {
  id: string;
  createdAt: string;
  engine: "gemini" | "claude" | "demo";
  model: string;
  title: string;
  subtitle: string;
  date: string;
  document: string;
  chunkCount?: number;
  topK?: number;
  scorer?: { name: string; tau: number; baseline: number; trustThreshold: number; reviewThreshold: number };
  runA: { key: string; label: string; promptLabel: string; model: string };
  runB: { key: string; label: string; promptLabel: string; model: string };
  questions: QuestionResult[];
  summary: Record<string, SummaryRow>;
};

type GroundlensConfig = {
  document_title: string;
  document_text: string;
  questions: { id: string; question: string }[];
};

const STORAGE_KEY = "groundlens_runs_v1";

// Bar scaling: SGI max is ~1/TAU ≈ 1.61; 1.7 gives headroom and a centered-ish baseline.
const SGI_MAX = 1.7;
const SGI_BASELINE = 1.0;

// Mapped onto the site's design tokens (index.css :root). Same field names as
// before, so the markup is unchanged — only the values shift from dark terminal
// to warm paper.
const C = {
  bg: "#fafaf7",        // page paper — outer container
  panel: "#ffffff",     // white cards
  panelAlt: "#f4f4f0",  // secondary surface (pipeline boxes, inputs)
  border: "#d6d3cc",    // rule-strong
  borderSoft: "#e7e5e0",// rule (hairline)
  track: "#e7e5e0",     // bar track
  baseline: "#a8a29e",  // baseline marker
  ink: "#0c0a09",       // primary text
  inkSoft: "#44403c",   // body
  inkMute: "#78716c",   // labels, captions
  blue: "#1e40af",      // single accent — deep ink blue
  green: "#166534",     // positive
  greenSoft: "#f0fdf4",
  amber: "#92400e",     // warn
  amberSoft: "#fffbeb",
  red: "#991b1b",       // negative
  redSoft: "#fef2f2",
};

const VERDICT: Record<Verdict, { label: string; bar: string; chipBg: string; chipFg: string; chipBd: string; Icon: typeof ShieldCheck }> = {
  trusted: { label: "TRUSTED", bar: C.green, chipBg: C.greenSoft, chipFg: C.green, chipBd: "#bbf7d0", Icon: ShieldCheck },
  review: { label: "REVIEW", bar: C.amber, chipBg: C.amberSoft, chipFg: C.amber, chipBd: "#fde68a", Icon: Eye },
  flagged: { label: "FLAGGED", bar: C.red, chipBg: C.redSoft, chipFg: C.red, chipBd: "#fecaca", Icon: Flag },
};

// A worked sample shown before any real run (and when no API key is configured).
// engine "demo" tells the renderer not to claim these are live numbers.
const DEMO_REPORT: GroundlensReport = {
  id: "demo",
  createdAt: new Date().toISOString(),
  engine: "demo",
  model: "sample",
  title: "groundlens",
  subtitle: "model risk q&a · A/B test of two LLM behaviors",
  date: "2026-05-24",
  document: "BVA Decision (Redacted Sample) — PTSD Increased Rating & TDIU",
  runA: { key: "calibrated", label: "Calibrated", promptLabel: "calibrated prompt", model: "sample" },
  runB: { key: "permissive", label: "Permissive", promptLabel: "permissive prompt", model: "sample" },
  questions: [
    {
      id: "Q1", question: "What evidence does the record contain regarding the severity of the Veteran's PTSD?",
      evidence: [], runs: [
        demoRun("calibrated", "Calibrated", 1.112, "trusted"),
        demoRun("permissive", "Permissive", 0.701, "flagged"),
      ],
      note: { text: "Permissive run invented specific examiner names, exam dates, and numeric symptom scales not in the source.", tone: "flagged" },
    },
    {
      id: "Q2", question: "What favorable findings did the Board accept as not in dispute?",
      evidence: [], runs: [
        demoRun("calibrated", "Calibrated", 1.284, "trusted"),
        demoRun("permissive", "Permissive", 0.892, "review"),
      ],
    },
    {
      id: "Q3", question: "How does the Board approach the increased-rating analysis for PTSD?",
      evidence: [], runs: [
        demoRun("calibrated", "Calibrated", 1.221, "trusted"),
        demoRun("permissive", "Permissive", 0.724, "flagged"),
      ],
      note: { text: "Permissive run fabricated a specific rating percentage and effective date the redacted decision withholds.", tone: "flagged" },
    },
    {
      id: "Q4", question: "What does the TDIU analysis require, and what does marginal employment mean here?",
      evidence: [], runs: [
        demoRun("calibrated", "Calibrated", 1.347, "trusted"),
        demoRun("permissive", "Permissive", 0.768, "flagged"),
      ],
      note: { text: "Permissive run cited a specific earnings threshold not stated in the document.", tone: "flagged" },
    },
    {
      id: "Q5", question: "What reasons-or-bases and duty-to-assist considerations did the Board weigh?",
      evidence: [], runs: [
        demoRun("calibrated", "Calibrated", 1.176, "trusted"),
        demoRun("permissive", "Permissive", 0.642, "flagged"),
      ],
      note: { text: "Permissive run invented specific remand instructions and a named development item not in the source.", tone: "flagged" },
    },
  ],
  summary: {
    calibrated: { label: "Calibrated", trusted: 5, review: 0, flagged: 0 },
    permissive: { label: "Permissive", trusted: 0, review: 1, flagged: 4 },
  },
};

function demoRun(regime: string, label: string, sgi: number, verdict: Verdict): RunResult {
  return { regime, label, model: "sample", answer: "", sgi, grounding: 0, verdict, sentenceSupport: [] };
}

function noteColor(tone?: string): string {
  if (tone === "flagged") return C.red;
  if (tone === "review") return C.amber;
  if (tone === "trusted") return C.green;
  return C.amber;
}

function PipelineBox({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex-1 min-w-[120px] px-4 py-3 text-center rounded" style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}>
      <div className="text-[13px] font-semibold tracking-tight" style={{ color: C.ink }}>{title}</div>
      <div className="text-[10px] font-mono mt-0.5" style={{ color: C.inkMute }}>{sub}</div>
    </div>
  );
}

function Arrow() {
  return <ArrowRight className="h-4 w-4 shrink-0" style={{ color: C.inkMute }} />;
}

function SgiBar({ run }: { run: RunResult }) {
  const v = VERDICT[run.verdict];
  const pct = Math.max(2, Math.min(100, (run.sgi / SGI_MAX) * 100));
  const basePct = (SGI_BASELINE / SGI_MAX) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="w-[88px] text-[12px] font-bold tracking-tight shrink-0" style={{ color: C.inkSoft }}>{run.label}</div>
      <div className="w-[78px] text-[11px] font-mono shrink-0" style={{ color: C.inkMute }}>SGI {run.sgi.toFixed(3)}</div>
      <div className="relative flex-1 h-[18px] rounded-sm overflow-hidden" style={{ background: C.track }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute left-0 top-0 bottom-0 rounded-sm"
          style={{ background: v.bar }}
        />
        <div className="absolute top-0 bottom-0 w-px" style={{ left: `${basePct}%`, background: C.baseline }} />
      </div>
    </div>
  );
}

function VerdictChip({ verdict }: { verdict: Verdict }) {
  const v = VERDICT[verdict];
  return (
    <div className="flex items-center justify-center gap-1.5 w-[108px] py-2 rounded text-[11px] font-bold tracking-wider"
      style={{ background: v.chipBg, color: v.chipFg, border: `1px solid ${v.chipBd}` }}>
      <v.Icon className="h-3.5 w-3.5" />
      {v.label}
    </div>
  );
}

function QuestionDetail({ q }: { q: QuestionResult }) {
  return (
    <div className="mt-2 ml-3 pl-3 space-y-3" style={{ borderLeft: `1px solid ${C.border}` }}>
      {q.runs.map((r) => (
        <div key={r.regime}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold" style={{ color: VERDICT[r.verdict].bar }}>{r.label}</span>
            <span className="text-[10px] font-mono" style={{ color: C.inkMute }}>
              grounding {r.grounding.toFixed(3)} · SGI {r.sgi.toFixed(3)}
            </span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: C.inkSoft }}>{r.answer || "—"}</p>
        </div>
      ))}
      {q.evidence.length > 0 && (
        <div className="pt-1">
          <div className="text-[10px] font-mono font-bold tracking-wider mb-1" style={{ color: C.inkMute }}>RETRIEVED EVIDENCE</div>
          <div className="space-y-1.5">
            {q.evidence.map((e, i) => (
              <div key={i} className="text-[11px] leading-relaxed" style={{ color: C.inkMute }}>
                <span style={{ color: C.blue }}>[E{i + 1}] </span>
                <span className="font-mono">({e.score.toFixed(3)})</span> {e.text.slice(0, 320)}{e.text.length > 320 ? "…" : ""}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryColumn({ row }: { row: SummaryRow }) {
  return (
    <div className="flex-1">
      <div className="text-[13px] font-bold tracking-tight mb-3" style={{ color: C.blue }}>{row.label}</div>
      <div className="flex items-start gap-6">
        {(["trusted", "review", "flagged"] as Verdict[]).map((k) => (
          <div key={k} className="text-center">
            <div className="text-2xl font-bold font-mono" style={{ color: VERDICT[k].bar }}>{row[k]}</div>
            <div className="text-[10px] font-mono mt-1" style={{ color: C.inkMute }}>{k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GroundlensMetrics() {
  const [report, setReport] = useState<GroundlensReport>(DEMO_REPORT);
  const [config, setConfig] = useState<GroundlensConfig | null>(null);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [error, setError] = useState("");
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [engineInfo, setEngineInfo] = useState<{ engine: string; model: string; source: string } | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/groundlens-data").then((r) => r.json()).then(setConfig).catch(() => setConfig(null));
    fetch("/api/groundlens-engine").then((r) => r.json()).then(setEngineInfo).catch(() => setEngineInfo(null));
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const hist: GroundlensReport[] = JSON.parse(raw);
        if (hist.length > 0) setReport(hist[0]);
      }
    } catch { /* ignore */ }
  }, []);

  const isLive = report.engine !== "demo";

  const runTest = async () => {
    setRunning(true);
    setError("");
    setApiKeyMissing(false);
    try {
      const res = await fetch("/api/groundlens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config || {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Run failed.");
      setReport(data.result);
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const hist: GroundlensReport[] = raw ? JSON.parse(raw) : [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify([data.result, ...hist].slice(0, 20)));
      } catch { /* ignore */ }
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (/GEMINI_API_KEY/i.test(msg) || /structured_output/i.test(msg)) {
        setApiKeyMissing(true);
        setReport(DEMO_REPORT);
      } else {
        setError(msg);
      }
    } finally {
      setRunning(false);
    }
  };

  const generateQuestions = async () => {
    if (!config) return;
    if (!config.document_text || config.document_text.trim().length < 200) {
      setError("Paste at least 200 characters of document text before generating questions.");
      return;
    }
    setGeneratingQuestions(true);
    setError("");
    setApiKeyMissing(false);
    try {
      const res = await fetch("/api/groundlens-generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_title: config.document_title,
          document_text: config.document_text,
          count: 5,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Question generation failed.");
      const qs: { id: string; question: string }[] = Array.isArray(data.questions) ? data.questions : [];
      if (qs.length === 0) throw new Error("Model returned no usable questions.");
      setConfig({ ...config, questions: qs.map((q, i) => ({ id: q.id || `Q${i + 1}`, question: q.question })) });
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (/GEMINI_API_KEY/i.test(msg) || /structured_output/i.test(msg)) {
        setApiKeyMissing(true);
      } else {
        setError(msg);
      }
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/groundlens-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed.");
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const summaryRows = useMemo(() => Object.values(report.summary || {}), [report]);

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: C.bg, border: `1px solid ${C.borderSoft}` }}>
      <div className="max-w-4xl mx-auto p-5 sm:p-7 space-y-4">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-2 pb-1">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl font-bold tracking-tight" style={{ color: C.ink }}>{report.title}</span>
            <span className="text-[12px]" style={{ color: C.inkSoft }}>{report.subtitle}</span>
          </div>
          <span className="text-[12px] font-mono" style={{ color: C.inkMute }}>{report.date}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={runTest}
              disabled={running}
              className="flex items-center gap-2 px-4 py-2 rounded text-[12px] font-bold tracking-tight transition-opacity disabled:opacity-60"
              style={{ background: C.blue, color: "#ffffff" }}
            >
              {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {running ? "Running A/B test…" : "Run test"}
            </button>
            <button
              onClick={() => setShowConfig((s) => !s)}
              className="flex items-center gap-2 px-3 py-2 rounded text-[12px] font-medium"
              style={{ background: C.panelAlt, color: C.inkSoft, border: `1px solid ${C.border}` }}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Configure
            </button>
          </div>
          <div className="text-[10px] font-mono" style={{ color: C.inkMute }}>
            engine: {engineInfo ? `${engineInfo.engine} · ${engineInfo.model}` : "…"}
          </div>
        </div>

        {/* Notices */}
        <AnimatePresence>
          {apiKeyMissing && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-2 px-3 py-2.5 rounded text-[11px] leading-relaxed"
              style={{ background: C.amberSoft, color: C.amber, border: `1px solid #fde68a` }}>
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              No live engine produced structured output (set <code>GEMINI_API_KEY</code> for the fast path). Showing the worked sample below.
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-2 px-3 py-2.5 rounded text-[11px] leading-relaxed"
              style={{ background: C.redSoft, color: C.red, border: `1px solid #fecaca` }}>
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Config editor */}
        <AnimatePresence>
          {showConfig && config && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden">
              <div className="px-4 py-4 rounded space-y-3" style={{ background: C.panel, border: `1px solid ${C.borderSoft}` }}>
                <div>
                  <label className="text-[10px] font-mono font-bold tracking-wider" style={{ color: C.inkMute }}>DOCUMENT TITLE</label>
                  <input
                    value={config.document_title}
                    onChange={(e) => setConfig({ ...config, document_title: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded text-[12px] outline-none"
                    style={{ background: C.panelAlt, color: C.ink, border: `1px solid ${C.border}` }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold tracking-wider" style={{ color: C.inkMute }}>SOURCE DOCUMENT</label>
                  <textarea
                    value={config.document_text}
                    onChange={(e) => setConfig({ ...config, document_text: e.target.value })}
                    rows={10}
                    className="w-full mt-1 px-3 py-2 rounded text-[12px] leading-relaxed outline-none resize-y"
                    style={{ background: C.panelAlt, color: C.inkSoft, border: `1px solid ${C.border}` }}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono font-bold tracking-wider" style={{ color: C.inkMute }}>QUESTIONS</label>
                    <button
                      onClick={generateQuestions}
                      disabled={generatingQuestions}
                      title="Generate a fresh question set from the document above"
                      className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium disabled:opacity-60"
                      style={{ background: C.panelAlt, color: C.blue, border: `1px solid ${C.border}` }}
                    >
                      {generatingQuestions ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      {generatingQuestions ? "Generating…" : "Generate from document"}
                    </button>
                  </div>
                  <div className="space-y-2 mt-1">
                    {config.questions.map((q, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          value={q.id}
                          onChange={(e) => {
                            const qs = [...config.questions];
                            qs[i] = { ...qs[i], id: e.target.value };
                            setConfig({ ...config, questions: qs });
                          }}
                          className="w-14 px-2 py-1.5 rounded text-[11px] font-bold outline-none"
                          style={{ background: C.panelAlt, color: C.blue, border: `1px solid ${C.border}` }}
                        />
                        <input
                          value={q.question}
                          onChange={(e) => {
                            const qs = [...config.questions];
                            qs[i] = { ...qs[i], question: e.target.value };
                            setConfig({ ...config, questions: qs });
                          }}
                          className="flex-1 px-2 py-1.5 rounded text-[12px] outline-none"
                          style={{ background: C.panelAlt, color: C.ink, border: `1px solid ${C.border}` }}
                        />
                        <button
                          onClick={() => setConfig({ ...config, questions: config.questions.filter((_, j) => j !== i) })}
                          className="p-1.5 rounded" style={{ color: C.inkMute }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, questions: [...config.questions, { id: `Q${config.questions.length + 1}`, question: "" }] })}
                    className="flex items-center gap-1.5 mt-2 text-[11px]" style={{ color: C.blue }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add question
                  </button>
                </div>
                <button
                  onClick={saveConfig}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 py-2 rounded text-[12px] font-medium disabled:opacity-60"
                  style={{ background: C.panelAlt, color: C.inkSoft, border: `1px solid ${C.border}` }}
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save corpus to disk
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document line */}
        <div className="px-4 py-2.5 rounded text-[12px]" style={{ background: C.panel, border: `1px solid ${C.borderSoft}` }}>
          <span style={{ color: C.inkMute }}>Document: </span>
          <span style={{ color: C.ink }}>{report.document}</span>
        </div>

        {/* Pipeline */}
        <div className="px-4 py-4 rounded" style={{ background: C.panel, border: `1px solid ${C.borderSoft}` }}>
          <div className="text-[11px] font-mono font-bold tracking-wider mb-3" style={{ color: C.inkSoft }}>PIPELINE · A/B</div>
          <div className="flex items-stretch gap-3 flex-wrap">
            <PipelineBox title="retriever" sub={`TF-IDF top-${report.topK ?? 3}`} />
            <div className="flex items-center"><Arrow /></div>
            <div className="flex-1 min-w-[180px] px-4 py-2.5 rounded space-y-1.5" style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}>
              <div className="text-[12px]">
                <span className="font-bold" style={{ color: C.green }}>Run A · {report.runA.label}</span>
                <div className="text-[10px] font-mono" style={{ color: C.inkMute }}>{report.runA.promptLabel} · {report.runA.model}</div>
              </div>
              <div className="text-[12px]">
                <span className="font-bold" style={{ color: C.amber }}>Run B · {report.runB.label}</span>
                <div className="text-[10px] font-mono" style={{ color: C.inkMute }}>{report.runB.promptLabel} · {report.runB.model}</div>
              </div>
            </div>
            <div className="flex items-center"><Arrow /></div>
            <PipelineBox title="SGI" sub="geometric scorer" />
            <div className="flex items-center"><Arrow /></div>
            <PipelineBox title="verdict" sub="trust/review/flag" />
          </div>
        </div>

        {/* Results */}
        <div className="px-4 py-4 rounded" style={{ background: C.panel, border: `1px solid ${C.borderSoft}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] font-mono font-bold tracking-wider" style={{ color: C.inkSoft }}>
              RESULTS · {report.questions.length} questions × {report.questions[0]?.runs.length ?? 2} runs
            </div>
            <div className="text-[10px] font-mono" style={{ color: C.inkMute }}>
              {isLive ? `live · ${report.engine} · ${report.model}` : "sample data · run for live numbers"}
            </div>
          </div>

          <div className="space-y-6">
            {report.questions.map((q) => {
              const open = !!expanded[q.id];
              const hasDetail = isLive && (q.runs.some((r) => r.answer) || q.evidence.length > 0);
              return (
                <div key={q.id} className="space-y-2.5">
                  <button
                    onClick={() => hasDetail && setExpanded((s) => ({ ...s, [q.id]: !s[q.id] }))}
                    className="flex items-start gap-2 text-left w-full"
                    style={{ cursor: hasDetail ? "pointer" : "default" }}
                  >
                    <span className="text-[13px] font-bold" style={{ color: C.blue }}>{q.id}</span>
                    <span className="text-[13px] flex-1" style={{ color: C.ink }}>{q.question}</span>
                    {hasDetail && (
                      <ChevronDown className="h-4 w-4 mt-0.5 transition-transform" style={{ color: C.inkMute, transform: open ? "rotate(180deg)" : "none" }} />
                    )}
                  </button>
                  <div className="space-y-2">
                    {q.runs.map((r) => (
                      <div key={r.regime} className="flex items-center gap-3">
                        <div className="flex-1"><SgiBar run={r} /></div>
                        <VerdictChip verdict={r.verdict} />
                      </div>
                    ))}
                  </div>
                  {q.note && (
                    <div className="text-[11px] pl-3" style={{ color: noteColor(q.note.tone) }}>-&gt; {q.note.text}</div>
                  )}
                  <AnimatePresence>
                    {open && hasDetail && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <QuestionDetail q={q} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="text-center text-[10px] font-mono mt-5" style={{ color: C.inkMute }}>
            SGI = {SGI_BASELINE.toFixed(1)} baseline{report.scorer ? ` · τ=${report.scorer.tau} · trust≥${report.scorer.trustThreshold} · review≥${report.scorer.reviewThreshold}` : ""}
          </div>
        </div>

        {/* Summary */}
        <div className="px-4 py-4 rounded" style={{ background: C.panel, border: `1px solid ${C.borderSoft}` }}>
          <div className="text-[11px] font-mono font-bold tracking-wider mb-4" style={{ color: C.inkSoft }}>SUMMARY</div>
          <div className="flex items-start gap-6 flex-wrap">
            {summaryRows.map((row, i) => (
              <div key={row.label} className={i > 0 ? "pl-6" : ""} style={{ flex: 1, borderLeft: i > 0 ? `1px solid ${C.border}` : "none" }}>
                <SummaryColumn row={row} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-3 text-[11px] font-mono" style={{ borderTop: `1px solid ${C.borderSoft}` }}>
          <span style={{ color: C.blue }}>github.com/groundlens</span>
          <span style={{ color: C.inkMute }}>deterministic · sub-second scorer · no LLM-as-judge</span>
        </div>
      </div>
    </div>
  );
}
