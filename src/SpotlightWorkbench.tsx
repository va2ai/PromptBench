import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  AlertCircle,
  Download,
  Eraser,
  FileText,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Copy,
  Anchor,
} from "lucide-react";

type SpotlightHook = {
  id: string;
  title: string;
  description: string;
  whyItMayMatter: string;
  sourceSupport: string[];
  scores: {
    strategicValue: number;
    readerInterest: number;
    sourceSupport: number;
    legalUsefulness: number;
    overclaimRisk: number;
  };
};

type SpotlightAnchor = {
  claim: string;
  supportingText: string;
  location: string;
};

export type SpotlightRun = {
  id: string;
  createdAt: string;
  documentType: string;
  model: string;
  engine?: "gemini" | "claude";
  sourceLength: number;
  _usage?: { prompt_tokens?: number; output_tokens?: number; cost_usd?: number | null };
  summary: { text: string; coveredIssues: string[] };
  hooks: SpotlightHook[];
  selectedHook: { id: string; title: string; reasonSelected: string };
  spotlight: {
    title: string;
    spotlight: string;
    whyItMatters: string;
    sourceAnchors: SpotlightAnchor[];
    whatNotToOverclaim: string[];
    nextBestQuestion: string;
  };
  faithfulnessCheck: {
    unsupportedClaims: string[];
    weakClaims: string[];
    missingSourceAnchors: string[];
    riskLevel: string;
    pass: boolean;
  };
  comparison: {
    whySummaryIsDifferent: string;
    whySpotlightIsBetterForEngagement: string;
    failureModeToWatch: string;
  };
};

const STORAGE_KEY = "spotlight_workbench_runs_v1";

// Roofr-derived palette
const C = {
  bg: "#f2f2f2",          // page bg (toned-down off-white)
  surface: "#f8f8f8",     // light card / panel
  surfaceAlt: "#ffffff",  // strongest card (kept minimal)
  border: "#ededed",      // hairline borders
  borderStrong: "#d8dee3",
  ink: "#28373e",         // primary text
  inkSoft: "#535353",     // body text
  inkMute: "#8a98a3",     // muted/labels
  brand: "#1373e3",       // Roofr primary blue
  brandDeep: "#0d509f",   // deeper blue
  brandInk: "#082e5b",    // darkest blue
  tint: "#e7f1fc",        // soft blue tint surfaces
  tintBorder: "#d0e3f9",
  cyan: "#2C9BD6",
  ok: "#009900",
};

const SAMPLE_VA = `Citation Nr: 0000000
Decision Date: 05/27/2026

ISSUE
Entitlement to service connection for obstructive sleep apnea, including as secondary to service-connected PTSD.

FINDINGS
The Veteran has a current diagnosis of obstructive sleep apnea confirmed by a sleep study. Service treatment records do not contain a formal diagnosis of sleep apnea. The Veteran submitted lay statements from a spouse and fellow servicemember describing loud snoring, pauses in breathing, and daytime fatigue during service. The Veteran is service connected for PTSD. A private article submitted by the Veteran discusses association between PTSD symptoms, sleep disruption, weight gain, and obstructive sleep apnea, but no clinician applied that literature to the Veteran's facts.

REASONS AND BASES
The Board acknowledges the Veteran's current diagnosis and lay evidence of sleep symptoms. The Board also acknowledges the Veteran's theory that PTSD contributed to weight gain and worsened sleep apnea. However, the Board finds the evidence does not establish a nexus between the current sleep apnea and active service or a service-connected disability. The Board assigns limited probative weight to the medical article because it is general in nature and does not address the Veteran's specific medical history. The Board finds the lay witnesses competent to describe observable symptoms but not competent to diagnose sleep apnea or provide a medical nexus opinion.

The record does not contain a VA medical opinion addressing whether the Veteran's PTSD caused or aggravated sleep apnea, including through weight gain as an intermediate step. The Board concludes that the duty to assist does not require an examination because the evidence does not show an in-service diagnosis or competent nexus evidence.

CONCLUSION
Service connection for obstructive sleep apnea, including as secondary to PTSD, is denied.`;

type SubTab = "comparison" | "hooks" | "spotlight" | "anchors" | "qa" | "raw";

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "comparison", label: "Comparison" },
  { key: "hooks", label: "Candidate Hooks" },
  { key: "spotlight", label: "Spotlight" },
  { key: "anchors", label: "Source Anchors" },
  { key: "qa", label: "QA / Faithfulness" },
  { key: "raw", label: "Raw JSON" },
];

const DOC_TYPES = [
  { value: "va_decision", label: "VA Decision" },
  { value: "legal_doc", label: "Legal Document" },
  { value: "research_paper", label: "Research Paper" },
  { value: "article", label: "Article" },
  { value: "other", label: "Other" },
];

type Tone = { label: string; bg: string; fg: string; bd: string };

function riskTone(risk?: string, pass?: boolean): Tone {
  const clean = String(risk || "").toLowerCase();
  if (pass && clean === "low") return { label: "Faithfulness: Low Risk", bg: "#ecfdf3", fg: "#047857", bd: "#a7f3d0" };
  if (clean === "high") return { label: "Faithfulness: High Risk", bg: "#fef2f2", fg: "#b91c1c", bd: "#fecaca" };
  return { label: `Faithfulness: ${risk || "Review"}`, bg: "#fffbeb", fg: "#b45309", bd: "#fde68a" };
}

function List({ items }: { items?: string[] }) {
  if (!items || items.length === 0) {
    return <p className="text-xs italic" style={{ color: C.inkMute }}>None.</p>;
  }
  return (
    <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed" style={{ color: C.inkSoft }}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function ScoreCell({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div
      className="rounded-lg py-2 text-center"
      style={{ background: C.bg, border: `1px solid ${C.border}` }}
    >
      <div
        className="text-[9px] font-extrabold uppercase tracking-wider min-h-[22px] leading-tight px-1"
        style={{ color: C.inkMute }}
      >
        {label}
      </div>
      <div className="text-base font-bold mt-0.5" style={{ color: C.ink }}>
        {value ?? "—"}
      </div>
    </div>
  );
}

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap"
      style={{ background: tone.bg, color: tone.fg, borderColor: tone.bd }}
    >
      {children}
    </span>
  );
}

type EngineInfo = { engine: "gemini" | "claude"; model: string; source: string };

export default function SpotlightWorkbench({ selectedModel, provider }: { selectedModel: string; provider: "gemini" | "claude" }) {
  const [documentType, setDocumentType] = useState<string>("va_decision");
  const [sourceText, setSourceText] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentRun, setCurrentRun] = useState<SpotlightRun | null>(null);
  const [activeSub, setActiveSub] = useState<SubTab>("comparison");
  const [history, setHistory] = useState<SpotlightRun[]>([]);
  const [engineInfo, setEngineInfo] = useState<EngineInfo | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setHistory(raw ? JSON.parse(raw) : []);
    } catch {
      setHistory([]);
    }
    fetch("/api/spotlight-engine")
      .then((r) => r.json())
      .then((d) => setEngineInfo(d))
      .catch(() => setEngineInfo(null));
  }, []);

  const persist = (runs: SpotlightRun[]) => {
    const trimmed = runs.slice(0, 50);
    setHistory(trimmed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  };

  const generate = async () => {
    setError("");
    if (sourceText.trim().length < 200) {
      setError("Paste a longer source document. The workbench needs enough text to identify hooks and anchors.");
      return;
    }
    setGenerating(true);
    try {
      const resp = await fetch("/api/spotlight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType, sourceText, model: selectedModel, provider }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data?.error || "Spotlight request failed.");
      }
      const run: SpotlightRun = data.result;
      setCurrentRun(run);
      persist([run, ...history]);
      setActiveSub("comparison");
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setGenerating(false);
    }
  };

  const exportJson = () => {
    if (!currentRun) {
      setError("No run available to export.");
      return;
    }
    const blob = new Blob([JSON.stringify(currentRun, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentRun.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const tone = useMemo(
    () => riskTone(currentRun?.faithfulnessCheck?.riskLevel, currentRun?.faithfulnessCheck?.pass),
    [currentRun],
  );

  // The whole tab sits inside a toned-down off-white frame
  return (
    <div
      className="rounded-3xl p-5 sm:p-6 animate-feed"
      style={{ background: C.bg, border: `1px solid ${C.border}` }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT — controls */}
        <aside className="lg:col-span-4 space-y-4">
          <Panel padded>
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl grid place-items-center text-white shrink-0"
                style={{ background: `linear-gradient(135deg, ${C.brand}, ${C.brandInk})` }}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight leading-none" style={{ color: C.ink }}>
                  Spotlight Workbench
                </h2>
                <p className="text-[11px] mt-1" style={{ color: C.inkMute }}>
                  Summary vs. spotlight, with anchors and overclaim guardrails.
                </p>
              </div>
            </div>

            <div
              className="mt-4 rounded-lg px-3 py-2.5 text-[11px] leading-relaxed flex items-start gap-2"
              style={{ background: C.tint, border: `1px solid ${C.tintBorder}`, color: C.brandInk }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: engineInfo ? C.ok : C.inkMute }} />
              <div>
                <div>
                  <strong>Engine:</strong>{" "}
                  {engineInfo ? (
                    <>
                      <span style={{ color: engineInfo.engine === "claude" ? "#7c3aed" : C.brand, fontWeight: 700 }}>
                        {engineInfo.engine === "claude" ? "Claude" : "Gemini"}
                      </span>
                      <span> · {engineInfo.model}</span>
                      <span className="text-[10px]" style={{ color: C.inkMute }}> ({engineInfo.source})</span>
                    </>
                  ) : (
                    <span style={{ color: C.inkMute }}>checking…</span>
                  )}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: C.inkMute }}>
                  {engineInfo?.engine === "claude"
                    ? "Falling back to claude -p because GEMINI_API_KEY is not set. ~$0.50/run via OAuth."
                    : "Server-side Gemini call; no browser API key required."}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <FieldLabel>Document Type</FieldLabel>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full text-sm rounded-lg px-3 py-2 outline-none transition"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.borderStrong}`,
                  color: C.ink,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = C.brand)}
                onBlur={(e) => (e.currentTarget.style.borderColor = C.borderStrong)}
              >
                {DOC_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 space-y-1.5">
              <FieldLabel>Source Document</FieldLabel>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste a VA decision, article, research excerpt, or other source text..."
                className="w-full min-h-[320px] text-sm rounded-lg px-3 py-2.5 font-mono leading-relaxed resize-y outline-none transition"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.borderStrong}`,
                  color: C.ink,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = C.brand)}
                onBlur={(e) => (e.currentTarget.style.borderColor = C.borderStrong)}
              />
              <p className="text-[10px]" style={{ color: C.inkMute }}>
                {sourceText.length.toLocaleString()} chars · minimum 200
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={generate}
                disabled={generating}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: generating ? C.brandDeep : C.brand }}
                onMouseEnter={(e) => { if (!generating) e.currentTarget.style.background = C.brandDeep; }}
                onMouseLeave={(e) => { if (!generating) e.currentTarget.style.background = C.brand; }}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" /> Generate Spotlight Run
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setDocumentType("va_decision");
                  setSourceText(SAMPLE_VA);
                }}
                className="font-semibold py-2.5 px-3 rounded-lg text-xs transition"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.borderStrong}`,
                  color: C.inkSoft,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.tint)}
                onMouseLeave={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
              >
                Load Sample
              </button>
              <button
                onClick={() => {
                  setSourceText("");
                  setError("");
                }}
                className="font-semibold py-2.5 px-3 rounded-lg text-xs transition flex items-center gap-1.5"
                style={{
                  background: "#fff1f2",
                  border: "1px solid #ffe4e6",
                  color: "#be123c",
                }}
              >
                <Eraser className="h-3 w-3" /> Clear
              </button>
            </div>

            {error && (
              <div
                className="mt-3 rounded-lg px-3 py-2.5 text-xs flex items-start gap-2"
                style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}
          </Panel>

          <Panel padded>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold tracking-tight" style={{ color: C.ink }}>
                Local Runs
              </h3>
              <span
                className="text-[10px] font-bold rounded-full px-2 py-0.5"
                style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.inkSoft }}
              >
                {history.length}
              </span>
            </div>
            {history.length === 0 ? (
              <p className="text-xs italic" style={{ color: C.inkMute }}>
                No saved local runs yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {history.map((run, idx) => {
                  const isActive = currentRun?.id === run.id;
                  const title = run.spotlight?.title || run.selectedHook?.title || "Untitled run";
                  const date = new Date(run.createdAt).toLocaleString();
                  const risk = run.faithfulnessCheck?.riskLevel || "unknown";
                  return (
                    <button
                      key={run.id || idx}
                      onClick={() => {
                        setCurrentRun(run);
                        setActiveSub("comparison");
                      }}
                      className="w-full text-left rounded-lg px-3 py-2 transition"
                      style={{
                        background: isActive ? C.tint : C.surface,
                        border: `1px solid ${isActive ? C.tintBorder : C.border}`,
                        color: isActive ? C.brandInk : C.inkSoft,
                      }}
                    >
                      <div className="text-xs font-bold leading-tight line-clamp-2">{title}</div>
                      <div className="text-[10px] mt-1" style={{ color: C.inkMute }}>
                        {date} · risk: <span className="font-semibold">{risk}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Panel>
        </aside>

        {/* RIGHT — output */}
        <section className="lg:col-span-8 space-y-4">
          <Panel>
            <div
              className="flex items-center justify-between gap-3 px-4 py-3"
              style={{ borderBottom: `1px solid ${C.border}`, background: C.surface }}
            >
              <div className="flex gap-1 overflow-x-auto">
                {SUB_TABS.map((t) => {
                  const active = activeSub === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setActiveSub(t.key)}
                      className="relative px-3 py-1.5 rounded-md text-[11px] font-bold whitespace-nowrap transition"
                      style={{ color: active ? C.brand : C.inkSoft }}
                    >
                      {active && (
                        <motion.span
                          layoutId="activeSpotlightSubTab"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          className="absolute inset-0 rounded-md"
                          style={{ background: C.tint, border: `1px solid ${C.tintBorder}` }}
                        />
                      )}
                      <span className="relative z-10">{t.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3">
                {currentRun && (
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full border whitespace-nowrap flex items-center gap-1"
                    style={{
                      background: currentRun.engine === "claude" ? "#f5f3ff" : C.tint,
                      color: currentRun.engine === "claude" ? "#6d28d9" : C.brand,
                      borderColor: currentRun.engine === "claude" ? "#ddd6fe" : C.tintBorder,
                    }}
                    title={currentRun._usage?.cost_usd ? `cost ~ $${currentRun._usage.cost_usd.toFixed(3)}` : undefined}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {currentRun.engine === "claude" ? "Claude" : "Gemini"} · {currentRun.model}
                  </span>
                )}
                <button
                  onClick={exportJson}
                  disabled={!currentRun}
                  className="flex items-center gap-1.5 text-[11px] font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: currentRun ? C.brand : C.inkMute }}
                >
                  <Download className="h-3.5 w-3.5" /> Export JSON
                </button>
              </div>
            </div>

            <div className="p-5 min-h-[520px]" style={{ background: C.surfaceAlt }}>
              {!currentRun ? (
                <div
                  className="grid place-items-center min-h-[460px] rounded-2xl text-center px-8 py-10"
                  style={{ border: `1px dashed ${C.borderStrong}`, background: C.bg }}
                >
                  <div>
                    <FileText className="h-10 w-10 mx-auto mb-3" style={{ color: C.inkMute }} />
                    <p className="text-sm font-bold" style={{ color: C.ink }}>
                      No run yet.
                    </p>
                    <p className="text-xs mt-1 max-w-md mx-auto leading-relaxed" style={{ color: C.inkSoft }}>
                      Paste a document and generate a workbench run. The system will produce a generic summary, candidate hooks, a selected hook, the spotlight, source anchors, and faithfulness warnings.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {activeSub === "comparison" && <ComparisonView run={currentRun} tone={tone} />}
                  {activeSub === "hooks" && <HooksView run={currentRun} />}
                  {activeSub === "spotlight" && <SpotlightView run={currentRun} tone={tone} />}
                  {activeSub === "anchors" && <AnchorsView run={currentRun} />}
                  {activeSub === "qa" && <QAView run={currentRun} tone={tone} />}
                  {activeSub === "raw" && <RawView run={currentRun} />}
                </>
              )}
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
}

function Panel({ children, padded }: { children: React.ReactNode; padded?: boolean }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: C.surfaceAlt,
        border: `1px solid ${C.border}`,
        boxShadow: "0 1px 0 rgba(13, 80, 159, 0.02)",
      }}
    >
      <div className={padded ? "p-5" : ""}>{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.inkMute }}>
      {children}
    </label>
  );
}

function Card({
  children,
  tone,
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "brand" | "warn";
  className?: string;
}) {
  const style: React.CSSProperties =
    tone === "brand"
      ? { background: C.tint, border: `1px solid ${C.tintBorder}` }
      : tone === "warn"
      ? { background: "#fffaf0", border: "1px solid #fde68a" }
      : { background: C.surfaceAlt, border: `1px solid ${C.border}` };
  return (
    <div className={`rounded-xl p-4 ${className || ""}`} style={style}>
      {children}
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: Tone;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div style={{ color: C.brand }}>{icon}</div>
        <h3 className="text-base font-extrabold tracking-tight" style={{ color: C.ink }}>
          {title}
        </h3>
      </div>
      {badge && <Badge tone={badge}>{badge.label}</Badge>}
    </div>
  );
}

function MutedLabel({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div
      className="text-[10px] font-extrabold uppercase tracking-wider mb-2"
      style={{ color: accent || C.inkMute }}
    >
      {children}
    </div>
  );
}

function ComparisonView({ run, tone }: { run: SpotlightRun; tone: Tone }) {
  return (
    <div className="space-y-4">
      <SectionHeading icon={<Sparkles className="h-4 w-4" />} title="Summary vs. Spotlight" badge={tone} />
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <MutedLabel>Generic Summary</MutedLabel>
          <p className="text-sm leading-relaxed" style={{ color: C.inkSoft }}>
            {run.summary?.text}
          </p>
          <div className="mt-4">
            <MutedLabel>Covered Issues</MutedLabel>
            <List items={run.summary?.coveredIssues} />
          </div>
        </Card>
        <Card tone="brand">
          <MutedLabel accent={C.brand}>Spotlight</MutedLabel>
          <h4 className="text-base font-extrabold tracking-tight mb-2" style={{ color: C.brandInk }}>
            {run.spotlight?.title}
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: C.ink }}>
            {run.spotlight?.spotlight}
          </p>
          <div className="mt-4">
            <MutedLabel accent={C.brand}>Why It Matters</MutedLabel>
            <p className="text-sm leading-relaxed" style={{ color: C.ink }}>
              {run.spotlight?.whyItMatters}
            </p>
          </div>
        </Card>
      </div>
      <Card>
        <MutedLabel>Workbench Comparison</MutedLabel>
        <div className="space-y-2 text-sm" style={{ color: C.inkSoft }}>
          <p>
            <strong style={{ color: C.ink }}>Why the summary is different:</strong>{" "}
            {run.comparison?.whySummaryIsDifferent}
          </p>
          <p>
            <strong style={{ color: C.ink }}>Why the spotlight is better for engagement:</strong>{" "}
            {run.comparison?.whySpotlightIsBetterForEngagement}
          </p>
          <p>
            <strong style={{ color: C.ink }}>Failure mode to watch:</strong>{" "}
            {run.comparison?.failureModeToWatch}
          </p>
        </div>
      </Card>
    </div>
  );
}

function HooksView({ run }: { run: SpotlightRun }) {
  const hooks = run.hooks || [];
  return (
    <div className="space-y-4">
      <SectionHeading
        icon={<Sparkles className="h-4 w-4" />}
        title="Candidate Hooks"
        badge={{ label: `${hooks.length} hooks`, bg: C.bg, fg: C.inkSoft, bd: C.border }}
      />
      {hooks.length === 0 ? (
        <p className="text-sm italic" style={{ color: C.inkMute }}>
          No hooks returned.
        </p>
      ) : (
        <div className="space-y-3">
          {hooks.map((hook) => {
            const isSelected = hook.id === run.selectedHook?.id;
            return (
              <div
                key={hook.id}
                className="rounded-xl p-4"
                style={{
                  background: isSelected ? "#ecfdf3" : C.surfaceAlt,
                  border: `1px solid ${isSelected ? "#a7f3d0" : C.border}`,
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h4 className="text-sm font-extrabold tracking-tight" style={{ color: C.ink }}>
                    {hook.title}
                  </h4>
                  {isSelected && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 whitespace-nowrap"
                      style={{ background: "#d1fae5", color: "#047857", borderColor: "#a7f3d0" }}
                    >
                      <CheckCircle2 className="h-3 w-3" /> Selected
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: C.inkSoft }}>
                  {hook.description}
                </p>
                <p className="text-xs mt-2" style={{ color: C.inkSoft }}>
                  <strong style={{ color: C.ink }}>Why it may matter:</strong> {hook.whyItMayMatter}
                </p>
                <div className="grid grid-cols-5 gap-2 mt-3">
                  <ScoreCell label="Strategic" value={hook.scores?.strategicValue} />
                  <ScoreCell label="Interest" value={hook.scores?.readerInterest} />
                  <ScoreCell label="Support" value={hook.scores?.sourceSupport} />
                  <ScoreCell label="Legal Use" value={hook.scores?.legalUsefulness} />
                  <ScoreCell label="Overclaim Risk" value={hook.scores?.overclaimRisk} />
                </div>
                <div className="mt-3">
                  <MutedLabel>Source Support</MutedLabel>
                  <List items={hook.sourceSupport} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {run.selectedHook?.reasonSelected && (
        <Card tone="brand">
          <p className="text-sm" style={{ color: C.brandInk }}>
            <strong>Reason this hook was selected:</strong> {run.selectedHook.reasonSelected}
          </p>
        </Card>
      )}
    </div>
  );
}

function SpotlightView({ run, tone }: { run: SpotlightRun; tone: Tone }) {
  return (
    <div className="space-y-4">
      <SectionHeading icon={<Sparkles className="h-4 w-4" />} title="Final Spotlight" badge={tone} />
      <Card tone="brand" className="!p-5">
        <h4 className="text-lg font-extrabold tracking-tight mb-2" style={{ color: C.brandInk }}>
          {run.spotlight?.title}
        </h4>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: C.ink }}>
          {run.spotlight?.spotlight}
        </p>
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <MutedLabel>Why This Matters</MutedLabel>
          <p className="text-sm leading-relaxed" style={{ color: C.inkSoft }}>
            {run.spotlight?.whyItMatters}
          </p>
        </Card>
        <Card>
          <MutedLabel>Next Best Question</MutedLabel>
          <p className="text-sm leading-relaxed" style={{ color: C.inkSoft }}>
            {run.spotlight?.nextBestQuestion}
          </p>
        </Card>
      </div>
      <Card tone="warn">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="h-4 w-4" style={{ color: "#b45309" }} />
          <MutedLabel accent="#b45309">What Not To Overclaim</MutedLabel>
        </div>
        <List items={run.spotlight?.whatNotToOverclaim} />
      </Card>
    </div>
  );
}

function AnchorsView({ run }: { run: SpotlightRun }) {
  const anchors = run.spotlight?.sourceAnchors || [];
  return (
    <div className="space-y-4">
      <SectionHeading
        icon={<Anchor className="h-4 w-4" />}
        title="Source Anchors"
        badge={{ label: `${anchors.length} anchors`, bg: C.bg, fg: C.inkSoft, bd: C.border }}
      />
      {anchors.length === 0 ? (
        <p className="text-sm italic" style={{ color: C.inkMute }}>
          No source anchors returned.
        </p>
      ) : (
        <div className="space-y-3">
          {anchors.map((a, i) => (
            <Card key={i}>
              <MutedLabel accent={C.brand}>Claim</MutedLabel>
              <p className="text-sm font-semibold leading-relaxed" style={{ color: C.ink }}>
                {a.claim}
              </p>
              <div className="mt-3">
                <MutedLabel>Supporting Text</MutedLabel>
                <p
                  className="text-sm leading-relaxed rounded-lg p-3"
                  style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.inkSoft }}
                >
                  {a.supportingText}
                </p>
              </div>
              <p className="text-[11px] mt-2" style={{ color: C.inkMute }}>
                <strong style={{ color: C.inkSoft }}>Location:</strong> {a.location || "Not specified"}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function QAView({ run, tone }: { run: SpotlightRun; tone: Tone }) {
  const qa = run.faithfulnessCheck || ({} as SpotlightRun["faithfulnessCheck"]);
  return (
    <div className="space-y-4">
      <SectionHeading icon={<ShieldAlert className="h-4 w-4" />} title="QA / Faithfulness" badge={tone} />
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <MutedLabel accent="#b91c1c">Unsupported Claims</MutedLabel>
          <List items={qa.unsupportedClaims} />
        </Card>
        <Card>
          <MutedLabel accent="#b45309">Weak Claims</MutedLabel>
          <List items={qa.weakClaims} />
        </Card>
        <Card>
          <MutedLabel>Missing Source Anchors</MutedLabel>
          <List items={qa.missingSourceAnchors} />
        </Card>
        <Card>
          <MutedLabel>Status</MutedLabel>
          <p className="text-sm" style={{ color: C.inkSoft }}>
            <strong style={{ color: C.ink }}>Pass:</strong>{" "}
            <span style={{ color: qa.pass ? C.ok : "#b91c1c", fontWeight: 700 }}>
              {qa.pass ? "Yes" : "No"}
            </span>
          </p>
          <p className="text-sm mt-1" style={{ color: C.inkSoft }}>
            <strong style={{ color: C.ink }}>Risk level:</strong> {qa.riskLevel || "unknown"}
          </p>
        </Card>
      </div>
    </div>
  );
}

function RawView({ run }: { run: SpotlightRun }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(run, null, 2);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionHeading
          icon={<FileText className="h-4 w-4" />}
          title="Raw JSON"
          badge={{ label: "Export-ready", bg: C.bg, fg: C.inkSoft, bd: C.border }}
        />
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(json);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          className="flex items-center gap-1.5 text-[11px] font-bold -mt-3"
          style={{ color: C.brand }}
        >
          <Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="text-[11px] leading-relaxed rounded-xl p-4 overflow-auto max-h-[520px] font-mono"
        style={{ background: C.brandInk, color: "#e7f1fc" }}
      >
        {json}
      </pre>
    </div>
  );
}
