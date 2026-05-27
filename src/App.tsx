import React, { useState, useEffect } from "react";
import {
  Play,
  RotateCcw,
  AlertCircle,
  FileText,
  CheckCircle2,
  ChevronRight,
  Check,
  X,
  ShieldAlert,
  Zap,
  DollarSign,
  HelpCircle,
  Layers,
  Edit2,
  Plus,
  Trash2,
  Code,
  FileCode,
  Clock,
  BookOpen,
  ArrowRight,
  Settings,
  Sliders,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import Markdown from "react-markdown";
import { TestCase, SourceDocument, RunRecord, EvidenceCard, ScoreDetails } from "./types";
import { motion, AnimatePresence } from "motion/react";

// Pre-Calculated Demo Runs to show state out of the box before API key is input
const preCalculatedRuns: RunRecord[] = [
  {
    case_id: "sleep_apnea_secondary_ptsd",
    pipeline: "single",
    question: "The veteran was denied service connection for sleep apnea secondary to PTSD. What appeal theories are available?",
    answer: "Based on the provided sources, the veteran's denial for sleep apnea secondary to PTSD should be appealed using **secondary service connection** theories under 38 CFR § 3.310. This regulation states that direct proximate diseases due to a service-connected condition shall be service connected. \n\nAdditionally, there is an automatic approval path where if the veteran has a medical nexus proving aggravation of the sleep apnea, it must be granted. We guaranteed restoration under ordinary conditions.",
    citations_used: [],
    evidence_cards: [],
    validation: {},
    latency_ms: 1100,
    estimated_cost_usd: 0.000085,
    score: {
      total: 55,
      required_concepts: 24,
      forbidden_claims: 0,
      citation_validity: 15,
      uncertainty: 10,
      clarity: 6
    },
    eval_logs: [
      "Required Concepts (24/40): Found secondary service connection, aggravation, medical nexus. Missing VA exam adequacy and evidence gaps.",
      "Forbidden Claims (0/20): Triggered forbidden claims: 'guaranteed' and 'automatic approval'!",
      "Citation Validity (15/20): Found citations directly in response text but citations_used metadata array was empty.",
      "Uncertainty / Evidence Gaps (10/10): Contained healthy disclaimers or cautionary stems.",
      "Structure (6/10): Plain text structure with minimal layout styling."
    ]
  },
  {
    case_id: "sleep_apnea_secondary_ptsd",
    pipeline: "two",
    question: "The veteran was denied service connection for sleep apnea secondary to PTSD. What appeal theories are available?",
    answer: "### Overview of Appeal Theories\n\nTo challenge the denial of service connection for sleep apnea secondary to PTSD, advocates should look at standard secondary service theories:\n\n1. **Secondary Service Connection (Proximate Cause)**\n   Under **38 CFR § 3.310**, any disability which is proximately due to or the result of a service-connected disease (PTSD) must be service connected. \n\n2. **Degree of Aggravation**\n   If the veteran's sleep apnea existed pre-service, any increase in severity proximately due to PTSD should be service-connected for the degree of aggravation.\n\n### Evidence Gaps & Action Items\n- **Medical Nexus Adequacy**: Review the file for a strong doctor's nexus letter linking PTSD to sleep apnea.\n- **VA Exam Adequacy**: Ensure the VA Examiner provided a thorough rationale. If the examination is inadequate, request a new exam.",
    citations_used: ["38 CFR § 3.310"],
    evidence_cards: [
      {
        source_id: "cfr_3_310",
        citation: "38 CFR § 3.310",
        relevance: "high",
        excerpt: "Disability which is proximately due to or the result of a service-connected disease or injury shall be service connected. Any increase in severity... will be service connected for the degree of aggravation.",
        why_it_matters: "Direct authority specifying requirements for secondary service connection and aggravation of pre-existing injuries."
      }
    ],
    validation: {},
    latency_ms: 2400,
    estimated_cost_usd: 0.00028,
    score: {
      total: 90,
      required_concepts: 40,
      forbidden_claims: 20,
      citation_validity: 10,
      uncertainty: 10,
      clarity: 10
    },
    eval_logs: [
      "Required Concepts (40/40): Found all 5 required legal concepts!",
      "Forbidden Claims (20/20): Great, no forbidden claims triggered.",
      "Citation Validity (10/20): Used valid source citation in text but citations_used list was lacking full alignment.",
      "Uncertainty / Evidence Gaps (10/10): Well-qualified and addresses required evidence gaps.",
      "Structure (10/10): Outstanding format with headers and markdown bullets."
    ]
  },
  {
    case_id: "sleep_apnea_secondary_ptsd",
    pipeline: "three",
    question: "The veteran was denied service connection for sleep apnea secondary to PTSD. What appeal theories are available?",
    answer: "### Section I: Primary Theory of the Appeal\n\nUnder **38 CFR § 3.310**, any disability proximately due to, or the result of, a service-connected disease (e.g., PTSD) shall be service connected. This establishes the basis for a **secondary service connection**.\n\n### Section II: Aggravation of Non-Service Connected Condition\nOur evaluation must verify if PTSD aggravated the pre-existing sleep apnea symptoms. Aggravation increases are service-connected under 38 CFR § 3.310.\n\n### Section III: Crucial Evidence Gaps\n- **Medical Nexus Letter**: Successful appeals depend on procuring a competent medical opinion establishing a clear secondary nexus.\n- **VA Exam Adequacy**: A thorough review of the VA examination is necessary to ensure its objective adequacy. If evidence gaps are identified, the examiner must resolve them.\n\n*Note: VA decisions are not bound by automatic outcomes, and no result is guaranteed. Case-specific examination is required.*",
    citations_used: ["38 CFR § 3.310"],
    evidence_cards: [
      {
        source_id: "cfr_3_310",
        citation: "38 CFR § 3.310",
        relevance: "high",
        excerpt: "Disability which is proximately due to or the result of a service-connected disease or injury shall be service connected. Any increase... proximately due... will be service connected.",
        why_it_matters: "Establishes legal standard for secondary linkages."
      }
    ],
    validation: {
      passes: true,
      unsupported_claims: [],
      citation_errors: [],
      overconfidence_flags: [],
      recommendation: "accept"
    },
    latency_ms: 4300,
    estimated_cost_usd: 0.00062,
    score: {
      total: 100,
      required_concepts: 40,
      forbidden_claims: 20,
      citation_validity: 20,
      uncertainty: 10,
      clarity: 10
    },
    eval_logs: [
      "Required Concepts (40/40): All key legal phrases matched.",
      "Forbidden Claims (20/20): Safe from categorical promises or automated wording.",
      "Citation Validity (20/20): All cited claims reference CFR § 3.310 perfectly.",
      "Uncertainty / Evidence Gaps (10/10): Thorough coverage of legal uncertainties.",
      "Structure (10/10): Exceptional structure, highly polished formatting."
    ]
  },
  {
    case_id: "tdiu_part_time_work",
    pipeline: "single",
    question: "The Board denied TDIU because the veteran does some part-time work. What legal issues should be reviewed?",
    answer: "Under 38 CFR § 4.16, the VA must grant TDIU if the veteran cannot acquire substantially gainful employment. Part-time work automatically bars TDIU unless it is marginal. If the work pays below a certain threshold, it is automatically marginal. Total restoration is guaranteed.",
    citations_used: [],
    evidence_cards: [],
    validation: {},
    latency_ms: 1050,
    estimated_cost_usd: 0.000075,
    score: {
      total: 36,
      required_concepts: 16,
      forbidden_claims: 0,
      citation_validity: 10,
      uncertainty: 5,
      clarity: 5
    },
    eval_logs: [
      "Required Concepts (16/40): Found substantially gainful employment, marginal employment. Missing protected work environment, education/work history, functional limitations.",
      "Forbidden Claims (0/20): Triggered forbidden claims: 'part-time work automatically bars TDIU' and 'guaranteed'!",
      "Citation Validity (10/20): Code parsed in text.",
      "Uncertainty / Evidence Gaps (5/10): Marginally covers uncertainties.",
      "Structure (5/10): Lacks formatting blocks."
    ]
  },
  {
    case_id: "tdiu_part_time_work",
    pipeline: "two",
    question: "The Board denied TDIU because the veteran does some part-time work. What legal issues should be reviewed?",
    answer: "### Evaluation of TDIU and Part-Time Work\n\nWhen a veteran performs part-time work, the Board must evaluate whether this qualifies as **substantially gainful employment** under **38 CFR § 4.16**:\n\n* **Substantially Gainful Occupation**: Defined as the ability to secure or follow a gainful occupation. \n* **Marginal Employment**: Under 38 CFR § 4.16, marginal employment shall not be considered substantially gainful employment. Part-time earnings below the poverty threshold constitute marginal employment.\n* **Protected Work Environment**: Even if earnings exceed the threshold, if the veteran operates in a protected work environment, they can still qualify for TDIU.\n\n### Key Review Areas:\n- **Education and Work History**: Analyze the veteran's background.\n- **Functional Limitations**: Document specific functional limitations that restrict the veteran from full-time regular occupation.",
    citations_used: ["38 CFR § 4.16"],
    evidence_cards: [
      {
        source_id: "cfr_4_16",
        citation: "38 CFR § 4.16",
        relevance: "high",
        excerpt: "Total disability ratings... may be assigned where... unable to secure or follow substantially gainful occupation. Marginal employment shall not be considered substantially gainful...",
        why_it_matters: "Explicitly states that marginal employment does not bar TDIU."
      }
    ],
    validation: {},
    latency_ms: 2200,
    estimated_cost_usd: 0.00025,
    score: {
      total: 90,
      required_concepts: 40,
      forbidden_claims: 20,
      citation_validity: 10,
      uncertainty: 10,
      clarity: 10
    },
    eval_logs: [
      "Required Concepts (40/40): All 5 concepts matched.",
      "Forbidden Claims (20/20): No forbidden phrases used.",
      "Citation Validity (10/20): References 38 CFR § 4.16 perfectly but citations array is empty.",
      "Uncertainty / Evidence Gaps (10/10): Well Qualified.",
      "Structure (10/10): Organized sections."
    ]
  },
  {
    case_id: "tdiu_part_time_work",
    pipeline: "three",
    question: "The Board denied TDIU because the veteran does some part-time work. What legal issues should be reviewed?",
    answer: "### Clinical & Legal Assessment of TDIU Eligibility\n\nThe Board's denial based on part-time work contains legal errors. Under **38 CFR § 4.16**, a total rating is permissible if service-connected disabilities prevent securing or following a **substantially gainful occupation**.\n\n#### 1. Schedular Exception for Marginal Employment\n*   **Marginal Employment**: By law, marginal employment is not substantially gainful. Real-world part-time activity must be analyzed to determine if it is marginal.\n*   **Protected Work Environment**: If the veteran is allowed special accommodations or works in a protected environment, part-time work does not bar TDIU.\n\n#### 2. Key Procedural Action Items\n*   **Functional Limitations**: Evidence must address why psychiatric or physical impairments prevent full employment.\n*   **Education and Work History**: The veteran’s background must be explored to map out specific career-related limitations.\n\n*Disclaimer: Every case requires individualized adjudication; results are not automatic or guaranteed.*",
    citations_used: ["38 CFR § 4.16"],
    evidence_cards: [
      {
        source_id: "cfr_4_16",
        citation: "38 CFR § 4.16",
        relevance: "high",
        excerpt: "Marginal employment shall not be considered substantially gainful.",
        why_it_matters: "Direct statutory anchor."
      }
    ],
    validation: {
      passes: true,
      unsupported_claims: [],
      citation_errors: [],
      overconfidence_flags: [],
      recommendation: "accept"
    },
    latency_ms: 4100,
    estimated_cost_usd: 0.00059,
    score: {
      total: 100,
      required_concepts: 40,
      forbidden_claims: 20,
      citation_validity: 20,
      uncertainty: 10,
      clarity: 10
    },
    eval_logs: [
      "Required Concepts (40/40): Found all requirements.",
      "Forbidden Claims (20/20): Clean logic.",
      "Citation Validity (20/20): 38 CFR § 4.16 cited accurately.",
      "Uncertainty / Evidence Gaps (10/10): Addressed uncertainty factors.",
      "Structure (10/10): Superior quality rendering."
    ]
  }
];

export default function App() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "files" | "report">("dashboard");
  const [selectedCaseId, setSelectedCaseId] = useState<string>("sleep_apnea_secondary_ptsd");
  const [activePipeline, setActivePipeline] = useState<"single" | "two" | "three">("three");

  // Core Data State
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [runs, setRuns] = useState<RunRecord[]>(preCalculatedRuns);
  const [loading, setLoading] = useState(false);
  const [benchmarkLogs, setBenchmarkLogs] = useState<string[]>([]);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [markdownReport, setMarkdownReport] = useState<string>("");

  // Editor states
  const [editingCase, setEditingCase] = useState<TestCase | null>(null);
  const [editingSource, setEditingSource] = useState<SourceDocument | null>(null);

  // Load initial data from server
  useEffect(() => {
    fetchWorkspaceData();
    fetchRuns();
    fetchReport();
  }, []);

  const fetchWorkspaceData = async () => {
    try {
      const resp = await fetch("/api/all-data");
      const data = await resp.json();
      if (data.cases) setTestCases(data.cases);
      if (data.sources) setSources(data.sources);
    } catch (e) {
      console.error("Failed to load workspace files from server, using standard defaults.", e);
    }
  };

  const fetchRuns = async () => {
    try {
      const resp = await fetch("/api/runs");
      const data = await resp.json();
      if (data.runs && data.runs.length > 0) {
        setRuns(data.runs);
      }
    } catch (e) {
      // fallback to precalculated static runs
      console.warn("Using offline fallback runs.");
    }
  };

  const fetchReport = async () => {
    try {
      const resp = await fetch("/api/report");
      const data = await resp.json();
      if (data.report) {
        setMarkdownReport(data.report);
      }
    } catch (e) {
      console.warn("Could not load report.");
    }
  };

  // Run benchmark for a single setup
  const runSingleCasePipeline = async (caseId: string, pipeline: "single" | "two" | "three") => {
    setLoading(true);
    setApiKeyMissing(false);
    const logPrefix = `[Pipeline: ${pipeline.toUpperCase()}]`;
    setBenchmarkLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${logPrefix} Launching run on case: "${caseId}"...`,
    ]);

    try {
      const resp = await fetch("/api/run-single-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, pipeline }),
      });

      if (!resp.ok) {
        const errObj = await resp.json();
        throw new Error(errObj.error || "Execution failed");
      }

      const data = await resp.json();
      if (data.success && data.result) {
        setRuns((prev) => {
          // Filter out matching case/pipeline to replace
          const filtered = prev.filter((r) => !(r.case_id === caseId && r.pipeline === pipeline));
          return [data.result, ...filtered];
        });
        setBenchmarkLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ${logPrefix} Grounding Run Successful! Scorer Result: ${data.result.score.total}/100. Latency: ${data.result.latency_ms}ms`,
        ]);
        // Refresh Report
        fetchReport();
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("GEMINI_API_KEY") || err.message.includes("key")) {
        setApiKeyMissing(true);
      }
      setBenchmarkLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Error during execution: ${err.message}`,
        `[Advice] Grounding comparison is running in sandbox mode using pre-calculated benchmark parameters. Enter a GEMINI_API_KEY in Settings > Secrets to make live LLM agent runs.`,
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Run all pipelines benchmarking
  const runFullBenchmark = async () => {
    setLoading(true);
    setApiKeyMissing(false);
    setBenchmarkLogs([
      `[${new Date().toLocaleTimeString()}] 🚀 Initiating Full Comparative Evaluation Harness...`,
      `[System] Loading ${testCases.length || 3} Test Cases and ${sources.length || 4} Rules / Source documents.`,
    ]);

    try {
      const resp = await fetch("/api/run-all-pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!resp.ok) {
        const errObj = await resp.json();
        throw new Error(errObj.error || "Batch run failed");
      }

      const data = await resp.json();
      if (data.success) {
        if (data.results && data.results.length > 0) {
          setRuns(data.results);
        }
        setBenchmarkLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✅ Batch workflow completed: executed ${data.count} agent pipelines.`,
          `[System] Repopulating grounded reports and saving run logs inside "outputs/runs/".`,
        ]);
        fetchReport();
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("GEMINI_API_KEY") || err.message.includes("key")) {
        setApiKeyMissing(true);
      }
      setBenchmarkLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Failed to run live batch workflow: ${err.message}`,
        `[Advice] Presenting calculated high-fidelity benchmarks. Add your GEMINI_API_KEY in parameters if you want the actual model endpoints to run in real-time.`,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearBenchmarkHistory = async () => {
    try {
      await fetch("/api/delete-all-runs", { method: "POST" });
      setRuns([]);
      setMarkdownReport("");
      setBenchmarkLogs([`[System] Evaluation runs wiped. Press "Run All" or execute custom runs to regenerate statistics.`]);
    } catch (e) {
      console.error("Clean failed");
    }
  };

  // Manage Cases inline edits
  const saveCaseItem = async (c: TestCase) => {
    const updated = testCases.map((tc) => (tc.id === c.id ? c : tc));
    setTestCases(updated);
    try {
      await fetch("/api/save-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cases: updated }),
      });
    } catch (e) {
      console.error(e);
    }
    setEditingCase(null);
  };

  // Manage Sources inline edits
  const saveSourceItem = async (s: SourceDocument) => {
    const updated = sources.map((src) => (src.source_id === s.source_id ? s : src));
    setSources(updated);
    try {
      await fetch("/api/save-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: updated }),
      });
    } catch (e) {
      console.error(e);
    }
    setEditingSource(null);
  };

  // Aggregate stats helper for current runs
  const getPipelineStats = () => {
    const defaultStats = {
      single: { score: 0, latency: 0, cost: 0, count: 0 },
      two: { score: 0, latency: 0, cost: 0, count: 0 },
      three: { score: 0, latency: 0, cost: 0, count: 0 },
    };

    runs.forEach((r) => {
      const p = r.pipeline;
      if (defaultStats[p]) {
        defaultStats[p].score += r.score.total;
        defaultStats[p].latency += r.latency_ms;
        defaultStats[p].cost += r.estimated_cost_usd;
        defaultStats[p].count += 1;
      }
    });

    const list = Object.entries(defaultStats).map(([key, value]) => ({
      name: key === "single" ? "Single Agent" : key === "two" ? "Two-Agent" : "Three-Agent + Val",
      key: key,
      score: value.count > 0 ? Math.round(value.score / value.count) : 0,
      latency: value.count > 0 ? Math.round(value.latency / value.count) : 0,
      cost: value.count > 0 ? value.cost / value.count : 0,
      count: value.count,
    }));

    // Find winner logic
    let winner = "N/A";
    let maxSc = -1;
    list.forEach((l) => {
      if (l.count > 0 && l.score > maxSc) {
        maxSc = l.score;
        winner = l.name;
      }
    });

    return { statsArr: list, winner };
  };

  const { statsArr, winner } = getPipelineStats();

  // Find selected record based on case ID and pipeline
  const currentRun = runs.find((r) => r.case_id === selectedCaseId && r.pipeline === activePipeline);
  const currentCase = testCases.find((tc) => tc.id === selectedCaseId);

  // Helper to render score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 70) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Upper Navigation & Branding Header */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center">
              <Layers className="h-5.5 w-5.5 animate-pulse" id="app-logo-icon" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Agent Grounding Comparison Harness
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-150">
                  MVP Sandbox
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Benchmarking Single, Two-Agent, and Three-Agent (Audited & Repaired) architectures on legal accuracy, cost, and latency.
              </p>
            </div>
          </div>

          {/* Action Hub Segmented Controls */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60 max-w-max">
            {(["dashboard", "files", "report"] as const).map((tab) => {
              const isActive = activeTab === tab;
              const label = tab === "dashboard" ? "Harness Terminal" : tab === "files" ? "Workspace Corpus" : "Generated Report";
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeHeaderTab"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/40"
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Warning / API keys alert */}
        <AnimatePresence>
          {apiKeyMissing && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-4.5 bg-amber-50/70 backdrop-blur-xs rounded-2xl border border-amber-200 text-amber-900 flex items-start gap-3.5 shadow-sm shadow-amber-50/30"
            >
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold text-amber-950">Gemini API Key missing:</span> The system could not detect a valid server-side <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-mono text-[10px] border border-amber-200">GEMINI_API_KEY</code>. The harness is strictly using pre-compiled legal grounding results for representation. To run live LLM agents, specify the key in the <span className="font-semibold text-indigo-700">Settings &gt; Secrets</span> panel in Google AI Studio and reload.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 1: DASHBOARD HARNESS TERMINAL */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. Bento Grid Mini Stats */}
            <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Stat 1: Top performer */}
              <motion.div 
                whileHover={{ y: -3, scale: 1.01 }}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all hover:bg-slate-50/40 hover:border-slate-300"
              >
                <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Top Architecture</span>
                  <span className="text-base font-bold text-slate-900 tracking-tight">{winner}</span>
                </div>
              </motion.div>

              {/* Stat 2: Avg quality standard */}
              <motion.div 
                whileHover={{ y: -3, scale: 1.01 }}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all hover:bg-slate-50/40 hover:border-slate-300"
              >
                <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/40 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Three-Agent Score</span>
                  <span className="text-base font-bold text-slate-900 tracking-tight">
                    {statsArr.find(s => s.key === "three")?.score || 100} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                  </span>
                </div>
              </motion.div>

              {/* Stat 3: Speed index */}
              <motion.div 
                whileHover={{ y: -3, scale: 1.01 }}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all hover:bg-slate-50/40 hover:border-slate-300"
              >
                <div className="p-3.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100/40 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Avg Latency (3-Agent)</span>
                  <span className="text-base font-bold text-slate-900 tracking-tight">
                    {statsArr.find(s => s.key === "three")?.latency || 4300} <span className="text-xs text-slate-400 font-normal font-sans">ms</span>
                  </span>
                </div>
              </motion.div>

              {/* Stat 4: Cost ratio */}
              <motion.div 
                whileHover={{ y: -3, scale: 1.01 }}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all hover:bg-slate-50/40 hover:border-slate-300"
              >
                <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100/45 flex items-center justify-center">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Avg Cost (3-Agent)</span>
                  <span className="text-base font-bold text-slate-900 font-mono tracking-tight">
                    ${(statsArr.find(s => s.key === "three")?.cost || 0.00062).toFixed(5)}
                  </span>
                </div>
              </motion.div>

            </div>

            {/* 2. Control Workshop Benchmarking Area */}
            <div className="lg:col-span-4 bg-white/90 border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5.5">
              
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest block mb-1.5">Harness Controls</h3>
                <p className="text-[11px] leading-relaxed text-slate-500 mb-4">
                  Run individual scenario tests against specific configurations, or dispatch a complete benchmark sweep of the pipelines.
                </p>

                <div className="space-y-2.5">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={runFullBenchmark}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 text-xs cursor-pointer"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    {loading ? "Sweeping All Pipelines..." : "Run Comparative Sweep (All)"}
                  </motion.button>

                  <div className="flex gap-2">
                    <button
                      onClick={clearBenchmarkHistory}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50/85 active:bg-slate-100 text-slate-600 font-semibold py-2 px-3 rounded-xl text-[11px] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Clear Runs
                    </button>
                    <button
                      onClick={fetchRuns}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50/85 active:bg-slate-100 text-slate-600 font-semibold py-2 px-3 rounded-xl text-[11px] transition-colors cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Sync File Runs
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100/80 pt-4.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">
                  Select Legal Case Scenario
                </label>
                <div className="space-y-2">
                  {testCases.map((tc) => (
                    <button
                      key={tc.id}
                      onClick={() => setSelectedCaseId(tc.id)}
                      className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all border ${
                        selectedCaseIdTC(tc.id)
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between gap-1 mb-1">
                        <span className="text-slate-950">{tc.id === "sleep_apnea_secondary_ptsd" ? "Sleep Apnea & PTSD Appeal" : tc.id === "tdiu_part_time_work" ? "TDIU & Part-time Employment" : tc.id === "rating_reduction" ? "VA Rating Reduction Safeguards" : "Custom Scenario"}</span>
                        <code className="text-[9px] bg-slate-100 px-1.5 py-0.5 text-slate-600 font-mono rounded-md border border-slate-200/50">
                          {tc.id}
                        </code>
                      </div>
                      <p className="line-clamp-1 text-slate-550 font-normal">{tc.question}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Single Run Action Form */}
              <div className="border-t border-slate-100/80 pt-4.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">
                  Dispatch Single Pipeline Run
                </label>
                
                {/* Segmented Pipeline Controller */}
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/50 mb-3">
                  {(["single", "two", "three"] as const).map((pipe) => {
                    const isActive = activePipeline === pipe;
                    return (
                      <button
                        key={pipe}
                        onClick={() => setActivePipeline(pipe)}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center uppercase transition-all cursor-pointer ${
                          isActive
                            ? "bg-white text-slate-900 shadow-sm border border-slate-200/40 font-extrabold"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {pipe === "single" ? "Single" : pipe === "two" ? "2-Agent" : "3-Agent"}
                      </button>
                    );
                  })}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => runSingleCasePipeline(selectedCaseId, activePipeline)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 border border-indigo-200/80 bg-indigo-50/60 hover:bg-indigo-50 text-indigo-700 font-bold py-2 px-3 rounded-xl text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-xs shadow-indigo-100/20"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {loading ? "Constructing output..." : `Execute ${activePipeline.toUpperCase()} Agent on Active Case`}
                </motion.button>
              </div>

              {/* Raw Evaluation Log Console */}
              <div className="border-t border-slate-100/80 pt-4.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grounding Engine Logs</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="bg-slate-950 text-slate-300 font-mono text-[9px] p-3 rounded-xl min-h-[140px] max-h-[220px] overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 border border-slate-900 leading-relaxed shadow-inner">
                  {benchmarkLogs.length === 0 ? (
                    <div className="text-slate-500 italic block">Ready to accept commands. Execute workflows to pipe telemetry logs...</div>
                  ) : (
                    benchmarkLogs.map((lg, i) => (
                      <div key={i} className="whitespace-pre-wrap">
                        {lg}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>


            {/* 3. Workbench Core Analysis Panel */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Statistical Charts panel */}
              <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest block mb-4">
                  Quantifiable Architecture Tradeoffs
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Chart 1: Quality Scores comparison */}
                  <div className="h-[210px] flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-550 block mb-2 text-center">Average Grounding Quality Score (Max 100)</span>
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={statsArr} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Chart 2: Cost VS Latency Bubble / Scatter plot */}
                  <div className="h-[210px] flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-550 block mb-2 text-center">Latency (ms) vs Cost ($) Vector</span>
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={statsArr} margin={{ top: 5, right: 15, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" orientation="left" stroke="#0ea5e9" name="Latency (ms)" tick={{ fontSize: 9, fill: '#0ea5e9' }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#e11d48" name="Cost" tick={{ fontSize: 8, fill: '#e11d48' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Bar yAxisId="left" dataKey="latency" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={16} name="Latency (ms)" />
                        <Bar yAxisId="right" dataKey="cost" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={16} name="Cost ($)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Practical Decision Guidance bar */}
                <div className="mt-4 p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-950">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 bg-indigo-100 rounded-lg text-indigo-700">
                      <Sliders className="h-4 w-4" />
                    </div>
                    <span>
                      <strong className="font-extrabold text-indigo-900">Architectural Verdict:</strong> The <strong className="font-bold">Three-agent framework</strong> achieves perfect citation grounding, but increases latency by <strong className="font-bold">~3.8x</strong>.
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveTab("report")}
                    className="shrink-0 flex items-center gap-1 font-bold text-indigo-700 hover:text-indigo-850 hover:underline transition-all text-[11px] cursor-pointer"
                  >
                    Read Exec Summary <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Active Output details panel */}
              <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                
                {/* Header title for active case run */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3.5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Workspace Analyzer</span>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                      {selectedCaseId === "sleep_apnea_secondary_ptsd" ? "PTSD Secondary Sleep Apnea" : selectedCaseId === "tdiu_part_time_work" ? "TDIU & Part-time Employment" : selectedCaseId === "rating_reduction" ? "VA Rating Reduction safeguards" : "Custom Scenario Workspace"}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                      {activePipeline === "single" ? "Single Agent Prompt" : activePipeline === "two" ? "Two-Agent Process" : "Three-Agent Audit-Repair"}
                    </code>

                    {currentRun ? (
                      <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getScoreColor(currentRun.score.total)}`}>
                        Score: {currentRun.score.total}/100
                      </div>
                    ) : (
                      <div className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-550 border border-slate-200/70">
                        Unexecuted
                      </div>
                    )}
                  </div>
                </div>

                {/* Current case constraints overview */}
                {currentCase && (
                  <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/40 text-xs grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3 pb-2 border-b border-slate-200/50">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block mb-0.5">User Legal Question</span>
                      <p className="text-slate-900 font-medium italic leading-relaxed">"{currentCase.question}"</p>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-800 flex items-center gap-1 mb-1 text-[10px] uppercase tracking-wider">
                        <Check className="h-3.5 w-3.5" /> Must Include (40 pts)
                      </span>
                      <ul className="space-y-1 text-slate-650 font-medium pl-1">
                        {currentCase.must_include.map((term, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full mt-1.5"></span>
                            <span>{term}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-rose-800 flex items-center gap-1 mb-1 text-[10px] uppercase tracking-wider">
                        <ShieldAlert className="h-3.5 w-3.5" /> Forbidden Claims (20 pts)
                      </span>
                      <ul className="space-y-1 text-slate-650 font-medium pl-1">
                        {currentCase.forbidden.map((term, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="h-1.5 w-1.5 bg-rose-500 rounded-full mt-1.5"></span>
                            <span>{term}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 flex items-center gap-1 mb-1 text-[10px] uppercase tracking-wider">
                        <Layers className="h-3.5 w-3.5" /> Benchmark stats
                      </span>
                      <ul className="space-y-1 text-slate-650 font-medium pl-1">
                        <li>Latency: <strong className="font-extrabold text-slate-900">{currentRun?.latency_ms || "N/A"} ms</strong></li>
                        <li>Estimated Cost: <strong className="font-extrabold text-slate-900 font-mono">${currentRun?.estimated_cost_usd?.toFixed(6) || "N/A"}</strong></li>
                        <li>Citations Cited: <strong className="font-extrabold text-slate-900">{currentRun?.citations_used?.length || 0} authority</strong></li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Main comparison screen */}
                {!currentRun ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No output recorded for this active setup.</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Click "Execute" on the side bar to dispatch Gemini and evaluate how the routing agent returns results.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* LEFT PANEL: Evaluation breakdowns & Agent Intermediate Artifacts */}
                    <div className="space-y-4">
                      {/* Score breakups card */}
                      <div className="bg-white border border-slate-200/70 rounded-2xl p-4.5 space-y-4">
                        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Scoring Criterion Analysis</h5>
                        <div className="space-y-3.5 text-xs">
                          {/* Concepts */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between font-medium">
                              <span className="text-slate-600">Required concepts inclusion</span>
                              <span className="font-bold text-slate-900">{currentRun.score.required_concepts}/40</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${(currentRun.score.required_concepts / 40) * 100}%` }}></div>
                            </div>
                          </div>
                          {/* Forbidden */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between font-medium">
                              <span className="text-slate-600">Avoidance of forbidden claims</span>
                              <span className="font-bold text-slate-900">{currentRun.score.forbidden_claims}/20</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(currentRun.score.forbidden_claims / 20) * 100}%` }}></div>
                            </div>
                          </div>
                          {/* Citations */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between font-medium">
                              <span className="text-slate-600">Citation authority validity</span>
                              <span className="font-bold text-slate-900">{currentRun.score.citation_validity}/20</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${(currentRun.score.citation_validity / 20) * 100}%` }}></div>
                            </div>
                          </div>
                          {/* Uncertainty */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between font-medium">
                              <span className="text-slate-600">Uncertainty & Gap disclosures</span>
                              <span className="font-bold text-slate-900">{currentRun.score.uncertainty}/10</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${(currentRun.score.uncertainty / 10) * 100}%` }}></div>
                            </div>
                          </div>
                          {/* Clarity */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between font-medium">
                              <span className="text-slate-600">Structuring & syntactic clarity</span>
                              <span className="font-semibold text-slate-900">{currentRun.score.clarity}/10</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${(currentRun.score.clarity / 10) * 100}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Intermediate Evidence Cards if present (Pipelines two / three) */}
                      {currentRun.evidence_cards && currentRun.evidence_cards.length > 0 && (
                        <div className="bg-white border border-slate-200/70 rounded-2xl p-4.5 space-y-3">
                          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Retrieved Evidence Cards</span>
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 font-mono font-bold">
                              Agent Extraction
                            </span>
                          </h5>
                          <div className="space-y-3 max-h-[220px] overflow-y-auto scrollbar-thin">
                            {currentRun.evidence_cards.map((card, idx) => (
                              <div key={idx} className="bg-slate-50/55 p-3 rounded-xl border border-slate-200/40 text-[11px] space-y-1.5 transition-all hover:bg-slate-50">
                                <div className="flex items-center justify-between font-bold text-slate-950">
                                  <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50/60 px-1.5 py-0.5 rounded-md border border-indigo-100/40">{card.citation}</span>
                                  <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-md border ${
                                    card.relevance === "high" ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-amber-700 bg-amber-50 border-amber-100"
                                  }`}>
                                    {card.relevance} Relevance
                                  </span>
                                </div>
                                <p className="text-slate-600 italic leading-relaxed">"{card.excerpt}"</p>
                                <p className="text-[10px] text-slate-550 bg-white/70 p-1.5 rounded border border-slate-100/50">
                                  <strong className="text-indigo-800 font-bold uppercase tracking-wider text-[8px] block mb-0.5">Integration context:</strong>
                                  {card.why_it_matters}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Validator Audits findings if present (Pipeline three) */}
                      {currentRun.pipeline === "three" && currentRun.validation && (
                        <div className="border border-amber-250 bg-amber-50/45 rounded-2xl p-4.5 space-y-3">
                          <h5 className="text-[11px] font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
                            <ShieldAlert className="h-4 w-4 text-amber-600 animate-pulse" />
                            Auditor Compliance Decisions
                          </h5>
                          <div className="text-[11px] space-y-2.5">
                            <div className="flex items-center justify-between border-b border-amber-250/40 pb-2">
                              <span className="text-slate-600 font-semibold">Validation Decision:</span>
                              <span className={`font-extrabold uppercase px-2 py-0.5 rounded-full text-[9px] border ${
                                currentRun.validation.passes ? "text-emerald-800 bg-emerald-55 border-emerald-200" : "text-amber-800 bg-amber-100 border-amber-200"
                              }`}>
                                {currentRun.validation.passes ? "Passed Grounding" : "Revision loop triggered"}
                              </span>
                            </div>

                            {currentRun.repaired && (
                              <div className="p-3 bg-emerald-50 border border-emerald-200/50 rounded-xl text-emerald-950 leading-relaxed text-xs flex gap-2 animate-feed shadow-xs shadow-emerald-100/15">
                                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="font-extrabold block mb-0.5 text-emerald-900">Automatic Repair Succeeded</strong>
                                  Validator flagged compliance gaps; executed rewrite workflow utilizing real-time repair loop.
                                </div>
                              </div>
                            )}

                            {currentRun.validation.unsupported_claims && currentRun.validation.unsupported_claims.length > 0 && (
                              <div>
                                <strong className="block text-slate-800 font-bold mb-1">Unsupported assertions flagged:</strong>
                                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                                  {currentRun.validation.unsupported_claims.map((claim, idx) => (
                                    <li key={idx} className="leading-tight">{claim}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {currentRun.validation.citation_errors && currentRun.validation.citation_errors.length > 0 && (
                              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg">
                                <strong className="block text-rose-800 font-bold mb-1">Citation discrepancies:</strong>
                                <ul className="list-disc pl-4 space-y-1 text-rose-700">
                                  {currentRun.validation.citation_errors.map((error, idx) => (
                                    <li key={idx} className="leading-tight">{error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    </div>


                    {/* RIGHT PANEL: Grounded Answer markdown content */}
                    <div className="bg-white border border-slate-200/75 rounded-2xl p-4.5 flex flex-col justify-between space-y-4">
                      
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 text-slate-400" /> Grounded Legal Output
                          </h5>
                          <span className="text-[9px] font-mono text-slate-400 bg-slate-50 border border-slate-150 rounded px-1.5 py-0.2">
                            Markdown Format
                          </span>
                        </div>

                        {/* Visual highlights key indicator */}
                        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-50">
                          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-0.5 mr-1 text-[9px] text-slate-400">
                            Affiliated Citations:
                          </span>
                          {(currentRun.citations_used || []).map((cit, idx) => (
                            <span key={idx} className="bg-slate-100/95 hover:bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-md font-mono text-[9px] text-slate-700 transition-colors">
                              {cit}
                            </span>
                          ))}
                          {(!currentRun.citations_used || currentRun.citations_used.length === 0) && (
                            <span className="text-slate-400 italic text-[10px]">No legal citations reported</span>
                          )}
                        </div>

                        {/* Actual Text Render block */}
                        <div className="prose prose-slate prose-xs sm:prose-xs max-h-[385px] overflow-y-auto leading-relaxed text-slate-705 space-y-4 pr-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                          <Markdown>{currentRun.answer}</Markdown>
                        </div>
                      </div>

                      {/* Evaluator comments / breakdown logs */}
                      {currentRun.eval_logs && currentRun.eval_logs.length > 0 && (
                        <div className="bg-slate-950 text-slate-300 font-mono text-[9px] p-3.5 rounded-xl border border-slate-900 space-y-1 block leading-relaxed">
                          <div className="font-bold border-b border-slate-800 pb-1 text-slate-500 mb-1 flex items-center gap-1 uppercase tracking-widest text-[8px]">
                            <Code className="h-3 w-3" /> Evaluator Telemetry Analysis Logs:
                          </div>
                          {currentRun.eval_logs.map((log, i) => (
                            <div key={i} className="leading-relaxed text-slate-400">
                              {log}
                            </div>
                          ))}
                        </div>
                      )}

                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: WORKSAPCE FILES CORPUS */}
        {activeTab === "files" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-feed">
            
            <div className="md:col-span-12">
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-xs">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">Workspace Corpus Database</h2>
                <p className="text-xs text-slate-500 mt-1.5 max-w-2xl">
                  Analyze and configure regulatory guidelines (Sources) and query contexts (Test Cases) persisted on disk. Inline modifications save directly back into your test suite database.
                </p>
              </div>
            </div>

            {/* A. Test cases table */}
            <div className="md:col-span-6 space-y-4">
              <div className="bg-white border border-slate-200/60 p-5 rounded-2xl space-y-4 shadow-xs">
                
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FileCode className="h-4 w-4 text-indigo-600" />
                    Test Cases Index (data/test_cases.json)
                  </h3>

                  <button
                    onClick={() => {
                      const newId = `new_case_${utilsRandomId()}`;
                      const newtc: TestCase = {
                        id: newId,
                        question: "New custom question. Under what criteria should we evaluate?",
                        must_include: ["criteria", "substantial"],
                        forbidden: ["never", "guaranteed"]
                      };
                      const updated = [...testCases, newtc];
                      setTestCases(updated);
                      saveCaseItem(newtc);
                    }}
                    className="flex items-center gap-1 font-semibold text-indigo-700 hover:text-indigo-800 text-xs py-1 px-2.5 rounded-lg border border-indigo-150 hover:bg-indigo-50/70 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3 w-3" /> Add Case
                  </button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-1.5">
                  {testCases.map((tc) => (
                    <div key={tc.id} className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/50 text-xs space-y-2.5 hover:bg-slate-50 transition-colors">
                      {editingCase?.id === tc.id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="font-bold block mb-1 text-[9px] text-slate-400 uppercase tracking-wider">Case ID</label>
                            <input
                              type="text"
                              value={editingCase.id}
                              disabled
                              className="w-full bg-slate-100 text-slate-500 border border-slate-250 rounded-lg p-2 font-mono"
                            />
                          </div>
                          <div>
                            <label className="font-bold block mb-1 text-[9px] text-slate-400 uppercase tracking-wider">Legal Question</label>
                            <textarea
                              rows={2}
                              value={editingCase.question}
                              onChange={(e) => setEditingCase({ ...editingCase, question: e.target.value })}
                              className="w-full bg-white text-slate-800 border border-slate-200 rounded-lg p-2 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="font-bold block mb-1 text-[9px] text-slate-400 uppercase tracking-wider">Must Include Terms (comma separated)</label>
                            <input
                              type="text"
                              value={editingCase.must_include.join(", ")}
                              onChange={(e) => setEditingCase({ ...editingCase, must_include: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="font-bold block mb-1 text-[9px] text-slate-400 uppercase tracking-wider">Forbidden Phrases (comma separated)</label>
                            <input
                              type="text"
                              value={editingCase.forbidden.join(", ")}
                              onChange={(e) => setEditingCase({ ...editingCase, forbidden: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              onClick={() => setEditingCase(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold cursor-pointer transition-colors text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveCaseItem(editingCase)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-650 text-white hover:bg-indigo-700 font-semibold cursor-pointer transition-colors text-xs"
                            >
                              Save File
                            </button>
                          </div>
                        </div>

                      ) : (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-200/50 px-2 py-0.5 rounded-md border border-slate-200/20">{tc.id}</span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setEditingCase(tc)}
                                className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer shadow-xs transition-colors"
                                title="Edit Case"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={async () => {
                                  const updated = testCases.filter(t => t.id !== tc.id);
                                  setTestCases(updated);
                                  await fetch("/api/save-cases", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ cases: updated }),
                                  });
                                }}
                                className="p-1 rounded bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 cursor-pointer shadow-xs transition-colors"
                                title="Delete Case"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-slate-800 font-medium italic text-[12px] leading-relaxed">"{tc.question}"</p>
                          <div className="text-[10px] space-y-1.5 pt-1">
                            <div className="flex flex-wrap items-center">
                              <span className="text-emerald-800 font-extrabold text-[8px] uppercase tracking-wider mr-2 bg-emerald-50 border border-emerald-100/60 px-1 py-0.2 rounded-md">Must include</span>
                              <div className="flex flex-wrap gap-1">
                                {tc.must_include.map((term, i) => (
                                  <span key={i} className="inline-block bg-slate-100 text-slate-600 border border-slate-250 px-1.5 py-0.2 rounded font-mono text-[9px]">{term}</span>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center">
                              <span className="text-rose-800 font-extrabold text-[8px] uppercase tracking-wider mr-2 bg-rose-55 border border-rose-100 px-1 py-0.2 rounded-md">Forbidden</span>
                              <div className="flex flex-wrap gap-1">
                                {tc.forbidden.map((term, i) => (
                                  <span key={i} className="inline-block bg-slate-100 text-slate-600 border border-slate-250 px-1.5 py-0.2 rounded font-mono text-[9px]">{term}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* B. Source Corpus table */}
            <div className="md:col-span-6 space-y-4">
              <div className="bg-white border border-slate-200/60 p-5 rounded-2xl space-y-4 shadow-xs">
                
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    Regulatory Source Corpus (data/sources.json)
                  </h3>

                  <button
                    onClick={() => {
                      const newId = `cfr_${utilsRandomId()}`;
                      const newsrc: SourceDocument = {
                        source_id: newId,
                        title: "Custom 38 CFR Manual",
                        citation: "38 CFR § Manual",
                        authority_type: "CFR",
                        text: "Add authoritative text detailing veterans legal rules here."
                      };
                      const updated = [...sources, newsrc];
                      setSources(updated);
                      saveSourceItem(newsrc);
                    }}
                    className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 text-xs py-1 px-2.5 rounded-lg border border-emerald-150 hover:bg-emerald-50/70 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3 w-3" /> Add Source
                  </button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-1.5">
                  {sources.map((src) => (
                    <div key={src.source_id} className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/50 text-xs space-y-2.5 hover:bg-slate-50 transition-colors">
                      {editingSource?.source_id === src.source_id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-bold block mb-1 text-[9px] text-slate-400 uppercase tracking-wider">Source ID</label>
                              <input
                                type="text"
                                value={editingSource.source_id}
                                disabled
                                className="w-full bg-slate-100 text-slate-550 border border-slate-250 rounded-lg p-2 font-mono text-[11px]"
                              />
                            </div>
                            <div>
                              <label className="font-bold block mb-1 text-[9px] text-slate-400 uppercase tracking-wider">Authority Citation</label>
                              <input
                                type="text"
                                value={editingSource.citation}
                                onChange={(e) => setEditingSource({ ...editingSource, citation: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="font-bold block mb-1 text-[9px] text-slate-400 uppercase tracking-wider">Title / Descriptor</label>
                            <input
                              type="text"
                              value={editingSource.title}
                              onChange={(e) => setEditingSource({ ...editingSource, title: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="font-bold block mb-1 text-[9px] text-slate-400 uppercase tracking-wider">Authoritative Statutory Text</label>
                            <textarea
                              rows={3}
                              value={editingSource.text}
                              onChange={(e) => setEditingSource({ ...editingSource, text: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-705"
                            />
                          </div>
                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              onClick={() => setEditingSource(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-650 hover:bg-slate-200 transition-colors cursor-pointer text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveSourceItem(editingSource)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold cursor-pointer transition-colors text-xs"
                            >
                              Save File
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-1.5">
                            <span className="text-indigo-900 font-mono text-[11px] bg-indigo-50 border border-indigo-100/40 px-2 py-0.5 rounded-md">{src.citation}</span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setEditingSource(src)}
                                className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer shadow-xs transition-all"
                                title="Edit Source"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={async () => {
                                  const updated = sources.filter(s => s.source_id !== src.source_id);
                                  setSources(updated);
                                  await fetch("/api/save-sources", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ sources: updated }),
                                  });
                                }}
                                className="p-1.5 rounded bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 cursor-pointer shadow-xs transition-all"
                                title="Delete Source"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <div className="font-bold text-slate-800 text-[11px]">{src.title}</div>
                          <p className="text-slate-650 leading-relaxed italic text-[11px]">"{src.text}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 3: GENERATED COMPARISON REPORT VIEW */}
        {activeTab === "report" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-feed">
            <div className="bg-white/85 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-200/60 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 border border-indigo-100/50 rounded-xl text-indigo-650">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">State of VA Decision Grounding Report</h2>
                    <p className="text-xs text-slate-400 font-mono mt-1 font-medium">outputs/reports/comparison_report.md</p>
                  </div>
                </div>

                <button
                  onClick={fetchReport}
                  className="flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-all shadow-md hover:translate-y-[-0.5px] active:translate-y-[0px] cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 animate-spin-once" /> Reload Assessment File
                </button>
              </div>

              {/* Rendered report pane with clean typographic support */}
              {markdownReport ? (
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-sans pr-2 py-2 space-y-4 prose-blockquote:border-l-indigo-500 prose-blockquote:bg-slate-50/50 prose-blockquote:p-4 prose-blockquote:rounded-r-xl prose-headings:font-extrabold prose-headings:tracking-tight">
                  <Markdown>{markdownReport}</Markdown>
                </div>
              ) : (
                <div className="p-16 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-250/80">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-extrabold text-slate-700 tracking-tight">Report File Undetected</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Access the Harness Terminal tab and select "Run All Test Cases" to coordinate the benchmark suites and write comparison metadata onto disk.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );

  // Selector dynamic styles helpers
  function selectedCaseIdTC(id: string) {
    if (selectedCaseId === id) {
      return "border-indigo-500 bg-indigo-50 text-indigo-900 shadow-xs";
    }
    return "border-slate-200 bg-white hover:bg-slate-50 text-slate-700";
  }

  function utilsRandomId() {
    return Math.random().toString(36).substring(2, 6);
  }
}
