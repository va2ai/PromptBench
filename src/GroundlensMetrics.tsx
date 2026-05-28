import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Eye, Flag } from "lucide-react";

// ---------------------------------------------------------------------------
// Groundlens — model-risk Q&A metrics tab.
//
// A/B comparison of two LLM behaviors over a single source document, scored by
// a deterministic geometric scorer (SGI — Source Grounding Index) that emits a
// trust / review / flag verdict per answer. This tab is self-contained with its
// own dark "terminal" palette; it does not share the editorial paper tokens
// used by App.tsx. The data below is a worked demo (no backend yet) shaped so a
// real /api/groundlens payload can drop straight in.
// ---------------------------------------------------------------------------

type Verdict = "trusted" | "review" | "flagged";

type RunResult = { model: string; sgi: number; verdict: Verdict };

type QuestionRow = {
  id: string;
  question: string;
  runs: RunResult[];
  note?: { text: string; tone: Verdict | "neutral" };
};

type GroundlensReport = {
  title: string;
  subtitle: string;
  date: string;
  document: string;
  runA: { model: string; prompt: string };
  runB: { model: string; prompt: string };
  questions: QuestionRow[];
};

// Center of the track is SGI = 1.0; full width is SGI = 2.0.
const SGI_BASELINE = 1.0;
const SGI_MAX = 2.0;

// Dark terminal palette — local to this component.
const C = {
  bg: "#0b0e14",
  panel: "#10141c",
  panelAlt: "#141925",
  border: "#1f2630",
  borderSoft: "#171c25",
  track: "#1b212b",
  baseline: "#3a4554",
  ink: "#e6edf3",
  inkSoft: "#aeb9c4",
  inkMute: "#6b7785",
  blue: "#4493f8",
  green: "#3fb950",
  greenSoft: "#1f3322",
  amber: "#d2a221",
  amberSoft: "#352c12",
  red: "#e5534b",
  redSoft: "#3a1d1c",
};

const VERDICT: Record<Verdict, { label: string; bar: string; chipBg: string; chipFg: string; chipBd: string; Icon: typeof ShieldCheck }> = {
  trusted: { label: "TRUSTED", bar: C.green, chipBg: C.greenSoft, chipFg: C.green, chipBd: "#2c5a33", Icon: ShieldCheck },
  review: { label: "REVIEW", bar: C.amber, chipBg: C.amberSoft, chipFg: C.amber, chipBd: "#5c4d1c", Icon: Eye },
  flagged: { label: "FLAGGED", bar: C.red, chipBg: C.redSoft, chipFg: C.red, chipBd: "#5e2b29", Icon: Flag },
};

const DEMO_REPORT: GroundlensReport = {
  title: "groundlens",
  subtitle: "model risk q&a · A/B test of two LLM behaviors",
  date: "2026-05-24",
  document: "Argonaut Bank — LLM Anomaly Screening (AASS) v2.1",
  runA: { model: "GPT-5", prompt: "calibrated prompt" },
  runB: { model: "Claude Opus 4-7", prompt: "permissive prompt" },
  questions: [
    {
      id: "Q1",
      question: "What inputs is the model exposed to that the training data did not cover?",
      runs: [
        { model: "GPT-5", sgi: 1.089, verdict: "trusted" },
        { model: "CLAUDE", sgi: 0.86, verdict: "review" },
      ],
    },
    {
      id: "Q2",
      question: "What is the documented failure mode and how was it characterized?",
      runs: [
        { model: "GPT-5", sgi: 0.584, verdict: "flagged" },
        { model: "CLAUDE", sgi: 0.596, verdict: "flagged" },
      ],
      note: {
        text: "BOTH flagged: retrieval pulled an unrelated section. Geometry surfaces upstream issues honestly.",
        tone: "neutral",
      },
    },
    {
      id: "Q3",
      question: "What is the worst case the safeguards do not catch?",
      runs: [
        { model: "GPT-5", sgi: 1.367, verdict: "trusted" },
        { model: "CLAUDE", sgi: 0.711, verdict: "flagged" },
      ],
      note: { text: "Run B (permissive) invented a specific worst-case scenario not in the source", tone: "flagged" },
    },
    {
      id: "Q4",
      question: "How was the system validated for regulatory acceptance?",
      runs: [
        { model: "GPT-5", sgi: 1.328, verdict: "trusted" },
        { model: "CLAUDE", sgi: 0.739, verdict: "flagged" },
      ],
      note: { text: "Run B (permissive) invented a third-party validator and a regulatory standard", tone: "flagged" },
    },
    {
      id: "Q5",
      question: "What drift has been measured since deployment?",
      runs: [
        { model: "GPT-5", sgi: 1.252, verdict: "trusted" },
        { model: "CLAUDE", sgi: 0.623, verdict: "flagged" },
      ],
      note: { text: "Run B (permissive) fabricated specific post-deployment drift numbers", tone: "flagged" },
    },
  ],
};

function noteColor(tone: Verdict | "neutral"): string {
  if (tone === "flagged") return C.red;
  if (tone === "review") return C.amber;
  if (tone === "trusted") return C.green;
  return C.amber;
}

function PipelineBox({ title, sub }: { title: string; sub: string }) {
  return (
    <div
      className="flex-1 min-w-[120px] px-4 py-3 text-center rounded"
      style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}
    >
      <div className="text-[13px] font-semibold tracking-tight" style={{ color: C.ink }}>
        {title}
      </div>
      <div className="text-[10px] font-mono mt-0.5" style={{ color: C.inkMute }}>
        {sub}
      </div>
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
      <div className="w-16 text-[12px] font-bold tracking-tight shrink-0" style={{ color: C.inkSoft }}>
        {run.model}
      </div>
      <div className="w-[88px] text-[11px] font-mono shrink-0" style={{ color: C.inkMute }}>
        SGI {run.sgi.toFixed(3)}
      </div>
      <div className="relative flex-1 h-[18px] rounded-sm overflow-hidden" style={{ background: C.track }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute left-0 top-0 bottom-0 rounded-sm"
          style={{ background: v.bar }}
        />
        {/* SGI = 1.0 baseline marker */}
        <div className="absolute top-0 bottom-0 w-px" style={{ left: `${basePct}%`, background: C.baseline }} />
      </div>
    </div>
  );
}

function VerdictChip({ verdict }: { verdict: Verdict }) {
  const v = VERDICT[verdict];
  return (
    <div
      className="flex items-center justify-center gap-1.5 w-[108px] py-2 rounded text-[11px] font-bold tracking-wider"
      style={{ background: v.chipBg, color: v.chipFg, border: `1px solid ${v.chipBd}` }}
    >
      <v.Icon className="h-3.5 w-3.5" />
      {v.label}
    </div>
  );
}

function SummaryColumn({ model, tallies }: { model: string; tallies: Record<Verdict, number> }) {
  return (
    <div className="flex-1">
      <div className="text-[13px] font-bold tracking-tight mb-3" style={{ color: C.blue }}>
        {model}
      </div>
      <div className="flex items-start gap-6">
        {(["trusted", "review", "flagged"] as Verdict[]).map((k) => (
          <div key={k} className="text-center">
            <div className="text-2xl font-bold font-mono" style={{ color: VERDICT[k].bar }}>
              {tallies[k]}
            </div>
            <div className="text-[10px] font-mono mt-1" style={{ color: C.inkMute }}>
              {k}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GroundlensMetrics() {
  const [report] = useState<GroundlensReport>(DEMO_REPORT);

  const tallies = useMemo(() => {
    const blank = (): Record<Verdict, number> => ({ trusted: 0, review: 0, flagged: 0 });
    const out: Record<string, Record<Verdict, number>> = {};
    for (const q of report.questions) {
      for (const r of q.runs) {
        out[r.model] = out[r.model] || blank();
        out[r.model][r.verdict] += 1;
      }
    }
    return out;
  }, [report]);

  const models = useMemo(() => {
    const seen: string[] = [];
    for (const q of report.questions) for (const r of q.runs) if (!seen.includes(r.model)) seen.push(r.model);
    return seen;
  }, [report]);

  const summaryLabel = (m: string) =>
    m === report.runA.model || m === "GPT-5" ? report.runA.model : report.runB.model;

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
      <div className="max-w-4xl mx-auto p-5 sm:p-7 space-y-4 font-mono">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-2 pb-1">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl font-bold tracking-tight" style={{ color: C.blue }}>
              {report.title}
            </span>
            <span className="text-[12px]" style={{ color: C.inkSoft }}>
              {report.subtitle}
            </span>
          </div>
          <span className="text-[12px]" style={{ color: C.inkMute }}>
            {report.date}
          </span>
        </div>

        {/* Document line */}
        <div className="px-4 py-2.5 rounded text-[12px]" style={{ background: C.panel, border: `1px solid ${C.borderSoft}` }}>
          <span style={{ color: C.inkMute }}>Document: </span>
          <span style={{ color: C.ink }}>{report.document}</span>
        </div>

        {/* Pipeline */}
        <div className="px-4 py-4 rounded" style={{ background: C.panel, border: `1px solid ${C.borderSoft}` }}>
          <div className="text-[11px] font-bold tracking-wider mb-3" style={{ color: C.inkSoft }}>
            PIPELINE · A/B
          </div>
          <div className="flex items-stretch gap-3 flex-wrap">
            <PipelineBox title="retriever" sub="TF-IDF top-K" />
            <div className="flex items-center">
              <Arrow />
            </div>
            <div
              className="flex-1 min-w-[180px] px-4 py-2.5 rounded space-y-1.5"
              style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}
            >
              <div className="text-[12px]">
                <span className="font-bold" style={{ color: C.green }}>Run A · {report.runA.model}</span>
                <div className="text-[10px]" style={{ color: C.inkMute }}>{report.runA.prompt}</div>
              </div>
              <div className="text-[12px]">
                <span className="font-bold" style={{ color: C.amber }}>Run B · {report.runB.model}</span>
                <div className="text-[10px]" style={{ color: C.inkMute }}>{report.runB.prompt}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Arrow />
            </div>
            <PipelineBox title="SGI" sub="geometric scorer" />
            <div className="flex items-center">
              <Arrow />
            </div>
            <PipelineBox title="verdict" sub="trust/review/flag" />
          </div>
        </div>

        {/* Results */}
        <div className="px-4 py-4 rounded" style={{ background: C.panel, border: `1px solid ${C.borderSoft}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] font-bold tracking-wider" style={{ color: C.inkSoft }}>
              RESULTS · {report.questions.length} questions × {models.length} runs
            </div>
            <div className="text-[10px]" style={{ color: C.inkMute }}>
              real data · Groundlens 1.0
            </div>
          </div>

          <div className="space-y-6">
            {report.questions.map((q) => (
              <div key={q.id} className="space-y-2.5">
                <div className="text-[13px]">
                  <span className="font-bold mr-2" style={{ color: C.blue }}>{q.id}</span>
                  <span style={{ color: C.ink }}>{q.question}</span>
                </div>
                <div className="space-y-2">
                  {q.runs.map((r) => (
                    <div key={r.model} className="flex items-center gap-3">
                      <div className="flex-1">
                        <SgiBar run={r} />
                      </div>
                      <VerdictChip verdict={r.verdict} />
                    </div>
                  ))}
                </div>
                {q.note && (
                  <div className="text-[11px] pl-3" style={{ color: noteColor(q.note.tone) }}>
                    -&gt; {q.note.text}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center text-[10px] mt-5" style={{ color: C.inkMute }}>
            SGI = {SGI_BASELINE.toFixed(1)} baseline · full scale {SGI_MAX.toFixed(1)}
          </div>
        </div>

        {/* Summary */}
        <div className="px-4 py-4 rounded" style={{ background: C.panel, border: `1px solid ${C.borderSoft}` }}>
          <div className="text-[11px] font-bold tracking-wider mb-4" style={{ color: C.inkSoft }}>
            SUMMARY
          </div>
          <div className="flex items-start gap-6 flex-wrap divide-x" style={{ borderColor: C.border }}>
            {models.map((m, i) => (
              <div key={m} className={i > 0 ? "pl-6" : ""} style={{ flex: 1 }}>
                <SummaryColumn model={summaryLabel(m)} tallies={tallies[m]} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between flex-wrap gap-2 pt-3 text-[11px]"
          style={{ borderTop: `1px solid ${C.borderSoft}` }}
        >
          <span style={{ color: C.blue }}>github.com/groundlens</span>
          <span style={{ color: C.inkMute }}>deterministic · sub-second · no LLM-as-judge</span>
        </div>
      </div>
    </div>
  );
}
