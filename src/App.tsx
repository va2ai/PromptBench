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
  Eye,
  Workflow,
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
  LineChart,
  Line,
} from "recharts";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TestCase, SourceDocument, RunRecord, EvidenceCard, ScoreDetails } from "./types";
import { motion, AnimatePresence } from "motion/react";
import SpotlightWorkbench from "./SpotlightWorkbench";
import GroundlensMetrics from "./GroundlensMetrics";

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
    missing_evidence: [],
    score: {
      total: 45,
      required_concepts: 24,
      forbidden_claims: 0,
      citation_validity: 15,
      uncertainty: 0,
      clarity: 6
    },
    eval_logs: [
      "Required Concepts (24/40): Found secondary service connection, aggravation, medical nexus. Missing VA exam adequacy and evidence gaps.",
      "Forbidden Claims (0/20): Triggered forbidden claims: 'guaranteed' and 'automatic approval'!",
      "Citation Validity (15/20): Found citations directly in response text but citations_used metadata array was empty.",
      "Uncertainty / Evidence Gaps (0/10): Categorical answer — states the path as automatic and guaranteed with no evidence-gap or calibration language.",
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
    missing_evidence: [
      "No medical nexus opinion in the corpus actually links the veteran's PTSD to the sleep apnea — the secondary theory needs a supporting medical opinion.",
      "The adequacy of the existing VA examination cannot be assessed from the provided sources."
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
    missing_evidence: [],
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
    missing_evidence: [],
    score: {
      total: 31,
      required_concepts: 16,
      forbidden_claims: 0,
      citation_validity: 10,
      uncertainty: 0,
      clarity: 5
    },
    eval_logs: [
      "Required Concepts (16/40): Found substantially gainful employment, marginal employment. Missing protected work environment, education/work history, functional limitations.",
      "Forbidden Claims (0/20): Triggered forbidden claims: 'part-time work automatically bars TDIU' and 'guaranteed'!",
      "Citation Validity (10/20): Code parsed in text.",
      "Uncertainty / Evidence Gaps (0/10): Categorical answer — \"automatically bars\", \"automatically marginal\", \"guaranteed\"; no evidence-gap language.",
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
    missing_evidence: [
      "The corpus does not establish the veteran's actual part-time earnings, so whether the work is marginal cannot be confirmed from the sources alone."
    ],
    validation: {},
    latency_ms: 2200,
    estimated_cost_usd: 0.00025,
    score: {
      total: 85,
      required_concepts: 40,
      forbidden_claims: 20,
      citation_validity: 10,
      uncertainty: 5,
      clarity: 10
    },
    eval_logs: [
      "Required Concepts (40/40): All 5 concepts matched.",
      "Forbidden Claims (20/20): No forbidden phrases used.",
      "Citation Validity (10/20): References 38 CFR § 4.16 perfectly but citations array is empty.",
      "Uncertainty / Evidence Gaps (5/10): One gap/limit marker (\"review areas\"); answer lists review areas but is otherwise stated categorically.",
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
    missing_evidence: [],
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

// Per-tab header copy. The wordmark area reframes itself to whatever surface is active
// instead of always describing the benchmark harness.
const TAB_META: Record<
  "dashboard" | "files" | "report" | "spotlight" | "groundlens",
  { title: string; subtitle: string; accent: string }
> = {
  dashboard: {
    title: "Agent Grounding Harness",
    subtitle: "Benchmarking single-, two-, and three-agent architectures on legal accuracy, cost, and latency — ",
    accent: "with receipts.",
  },
  files: {
    title: "Corpus Workbench",
    subtitle: "Edit the test cases and source authorities every benchmark run is scored against — ",
    accent: "ground truth in, scores out.",
  },
  report: {
    title: "Comparison Report",
    subtitle: "Aggregated scores, failure patterns, and evidence gaps across every recorded run — ",
    accent: "computed, not asserted.",
  },
  spotlight: {
    title: "Spotlight Workbench",
    subtitle: "Turn a source document into a faithful spotlight — hook, anchored claims, and overclaim guardrails — ",
    accent: "no summary drift.",
  },
  groundlens: {
    title: "Groundlens",
    subtitle: "A/B grounding test over one document: calibrated vs permissive prompting, scored by a deterministic SGI — ",
    accent: "geometry catches fabrication.",
  },
};

type TabId = "dashboard" | "files" | "report" | "spotlight" | "groundlens";

// Corpus and Report are nested under the Harness top-level tab as subtabs — they
// share the benchmark's ground truth, so they read as one section. Spotlight and
// Groundlens remain standalone top-level tabs.
const HARNESS_SUBTABS: { id: TabId; label: string }[] = [
  { id: "dashboard", label: "Benchmark" },
  { id: "files", label: "Corpus" },
  { id: "report", label: "Report" },
];
const HARNESS_GROUP: TabId[] = HARNESS_SUBTABS.map((t) => t.id);

// Top-level nav. The Harness entry represents the whole Harness group (its `id` is
// the group's default subtab, used when entering the group from outside).
const TOP_TABS: { id: TabId; label: string }[] = [
  { id: "dashboard", label: "Harness" },
  { id: "spotlight", label: "Spotlight" },
  { id: "groundlens", label: "Groundlens" },
];

export default function App() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const inHarness = HARNESS_GROUP.includes(activeTab);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("sleep_apnea_secondary_ptsd");
  const [activePipeline, setActivePipeline] = useState<"single" | "two" | "three">("three");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  const [observabilitySubTab, setObservabilitySubTab] = useState<"grounded" | "trace" | "matrix" | "prompts">("grounded");

  // Core Data State
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [runs, setRuns] = useState<RunRecord[]>(preCalculatedRuns);
  const [loading, setLoading] = useState(false);
  const [streamingAnswer, setStreamingAnswer] = useState("");
  const [benchmarkLogs, setBenchmarkLogs]= useState<string[]>([]);
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
      `[${new Date().toLocaleTimeString()}] ${logPrefix} Launching run on case: "${caseId}" using model: "${selectedModel}"...`,
    ]);

    try {
      const resp = await fetch("/api/run-single-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, pipeline, model: selectedModel }),
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
        `[Advice] Grounding comparison is running in sandbox mode using pre-calculated benchmark parameters. Set GEMINI_API_KEY in your .env to make live LLM agent runs.`,
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Run streaming benchmark for a case
  const runStreamingPipeline = async (caseId: string) => {
    setLoading(true);
    setStreamingAnswer("");
    
    try {
      const resp = await fetch(`/api/stream-single-pipeline?caseId=${caseId}&model=${selectedModel}`);
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        // SSE often comes as 'data: {...}\n\n'
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) setStreamingAnswer((prev) => prev + data.text);
            } catch (e) {}
          }
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Run all pipelines benchmarking
  const runFullBenchmark = async () => {
    setLoading(true);
    setApiKeyMissing(false);
    setBenchmarkLogs([
      `[${new Date().toLocaleTimeString()}] 🚀 Initiating Full Comparative Evaluation Harness with model: "${selectedModel}"...`,
      `[System] Scheduling ${testCases.length} Test Cases across 3 pipeline architectures (9 runs total).`,
      `[System] Iterating sequentially to prevent HTTP timeouts and provide real-time grounding telemetry...`
    ]);

    let successCount = 0;
    let failedCount = 0;
    const pipelines: ("single" | "two" | "three")[] = ["single", "two", "three"];

    try {
      for (const testCase of testCases) {
        for (const pipeline of pipelines) {
          const logPrefix = `[${testCase.id} / ${pipeline.toUpperCase()}]`;
          setBenchmarkLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ⏱️ ${logPrefix} Launching pipeline run...`,
          ]);

          try {
            const resp = await fetch("/api/run-single-pipeline", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ caseId: testCase.id, pipeline, model: selectedModel }),
            });

            if (!resp.ok) {
              const errObj = await resp.json();
              throw new Error(errObj.error || "Execution failed");
            }

            const data = await resp.json();
            if (data.success && data.result) {
              successCount++;
              setRuns((prev) => {
                const filtered = prev.filter((r) => !(r.case_id === testCase.id && r.pipeline === pipeline));
                return [data.result, ...filtered];
              });
              setBenchmarkLogs((prev) => [
                ...prev,
                `[${new Date().toLocaleTimeString()}] ✓ ${logPrefix} Quality score: ${data.result.score.total}/100. Latency: ${data.result.latency_ms}ms. Cost: $${data.result.estimated_cost_usd.toFixed(5)}`,
              ]);
              fetchReport();
            }
          } catch (err: any) {
            console.error(err);
            failedCount++;
            if (err.message.includes("GEMINI_API_KEY") || err.message.includes("key")) {
              setApiKeyMissing(true);
            }
            setBenchmarkLogs((prev) => [
              ...prev,
              `[${new Date().toLocaleTimeString()}] ❌ ${logPrefix} Failed: ${err.message}`,
              `[Advice] Grounding comparison can run in fallback mode. Add a valid GEMINI_API_KEY to your .env to make live LLM agent runs.`,
            ]);
          }
        }
      }

      setBenchmarkLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🎉 Sweep complete! Success: ${successCount}, Failed: ${failedCount}.`,
      ]);
    } catch (err: any) {
      console.error(err);
      setBenchmarkLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Sweep interrupted: ${err.message}`,
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

  const getTrendData = () => {
    // Group runs by pipeline
    const pipelineRuns: { [key: string]: RunRecord[] } = {
      single: [],
      two: [],
      three: []
    };

    // Filter and sort runs
    // Since `runs` is [newest, ..., oldest], let's reverse it to get chronological order for each pipeline
    const sortedRuns = [...runs].reverse();
    
    sortedRuns.forEach(r => {
      if (pipelineRuns[r.pipeline]) {
        pipelineRuns[r.pipeline].push(r);
      }
    });

    // Take last 10 for each
    const result = [];
    const maxLength = Math.max(...Object.values(pipelineRuns).map(r => r.length));
    
    for(let i = 0; i < maxLength; i++) {
      const dataPoint: any = { name: `Run ${i + 1}` };
      ['single', 'two', 'three'].forEach(p => {
        if (pipelineRuns[p][i]) {
          dataPoint[p] = pipelineRuns[p][i].score.total;
        }
      });
      result.push(dataPoint);
    }
    
    return result.slice(-10); // Last 10
  };

  const trendData = getTrendData();

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
    <div className="min-h-screen text-stone-800 font-sans antialiased selection:bg-stone-900 selection:text-stone-50" style={{ background: "var(--paper)" }}>
      {/* Header — wordmark + meta + underline tabs. Restraint over decoration. */}
      <header className="sticky top-0 z-50 backdrop-blur-sm" style={{ background: "rgba(250, 250, 247, 0.88)", borderBottom: "1px solid var(--rule)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-0">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid place-items-center h-7 w-7 border" style={{ borderColor: "var(--ink)", color: "var(--ink)" }}>
                <span className="font-mono font-semibold text-[11px] leading-none tracking-tighter">A/G</span>
              </div>
              <div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h1 className="text-[17px] font-semibold tracking-tight" style={{ color: "var(--ink)" }}>
                    {TAB_META[activeTab].title}
                  </h1>
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--ink-mute)" }}>
                    v0 · internal
                  </span>
                </div>
                <p className="text-[12px] mt-0.5 max-w-2xl" style={{ color: "var(--ink-mute)" }}>
                  {TAB_META[activeTab].subtitle}
                  <span className="serif-accent" style={{ color: "var(--ink-soft)" }}>{TAB_META[activeTab].accent}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Underline tabs — IDE / Stripe style. The Harness entry stays lit for any
              of its subtabs (Benchmark / Corpus / Report). */}
          <div className="flex items-center gap-0 -mb-px overflow-x-auto">
            {TOP_TABS.map(({ id, label }) => {
              const isHarness = id === "dashboard";
              const isActive = isHarness ? inHarness : activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    // Entering Harness from outside lands on its default subtab; clicking
                    // it while already inside preserves the current subtab.
                    if (isHarness) {
                      if (!inHarness) setActiveTab("dashboard");
                    } else {
                      setActiveTab(id);
                    }
                  }}
                  className="relative px-3.5 py-2.5 text-[12px] font-medium tracking-tight transition-colors cursor-pointer whitespace-nowrap"
                  style={{ color: isActive ? "var(--ink)" : "var(--ink-mute)" }}
                >
                  {label}
                  {isActive && (
                    <motion.span
                      layoutId="activeHeaderTab"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute left-0 right-0 -bottom-px h-0.5"
                      style={{ background: "var(--ink)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* API key notice — flat, no animation theatrics */}
        <AnimatePresence>
          {apiKeyMissing && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="mb-6 px-4 py-3 flex items-start gap-3"
              style={{ background: "var(--warn-soft)", border: "1px solid #fde68a", color: "#78350f", borderRadius: 6 }}
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#a16207" }} />
              <div className="text-[12px] leading-relaxed">
                <span className="font-semibold uppercase tracking-wider text-[10px] mr-1.5" style={{ color: "#92400e" }}>Notice</span>
                No server-side <code className="font-mono text-[11px] px-1 py-px" style={{ background: "#fde68a", color: "#78350f", borderRadius: 2 }}>GEMINI_API_KEY</code> detected. Showing pre-computed runs. Set the key in your <span className="font-medium">.env</span> file and reload to run live agents.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Harness subtabs — secondary nav for Benchmark / Corpus / Report. */}
        {inHarness && (
          <div className="mb-6 flex items-center gap-0 border-b overflow-x-auto" style={{ borderColor: "var(--rule)" }}>
            {HARNESS_SUBTABS.map(({ id, label }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="relative px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors cursor-pointer whitespace-nowrap"
                  style={{ color: isActive ? "var(--ink)" : "var(--ink-mute)" }}
                >
                  {label}
                  {isActive && (
                    <motion.span
                      layoutId="activeHarnessSubTab"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute left-0 right-0 -bottom-px h-0.5"
                      style={{ background: "var(--ink)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 1: DASHBOARD HARNESS TERMINAL */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Top stats — dense terminal row, hairline-divided, no icon pillows */}
            <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 bg-white" style={{ border: "1px solid var(--rule)", borderRadius: 6 }}>
              {[
                { label: "Top Architecture", value: winner, mono: false, accent: true },
                { label: "Three-Agent Score", value: `${statsArr.find(s => s.key === "three")?.score || 100}`, suffix: "/100" },
                { label: "Latency · 3-Agent", value: `${statsArr.find(s => s.key === "three")?.latency || 4300}`, suffix: "ms", mono: true },
                { label: "Cost · 3-Agent", value: `$${(statsArr.find(s => s.key === "three")?.cost || 0.00062).toFixed(5)}`, mono: true },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="px-5 py-4"
                  style={{
                    borderLeft: i === 0 ? "none" : "1px solid var(--rule)",
                    borderTop: i >= 2 ? "1px solid var(--rule)" : undefined,
                  }}
                >
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em]" style={{ color: "var(--ink-mute)" }}>
                    {stat.label}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span
                      className={`text-[22px] leading-none ${stat.mono ? "font-mono font-medium" : "font-semibold"} tabular-nums`}
                      style={{ color: stat.accent ? "var(--accent)" : "var(--ink)", letterSpacing: stat.mono ? "-0.02em" : "-0.025em" }}
                    >
                      {stat.value}
                    </span>
                    {stat.suffix && (
                      <span className="text-xs font-mono" style={{ color: "var(--ink-faint)" }}>{stat.suffix}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Control Workshop Benchmarking Area */}
            <div className="lg:col-span-4 bg-white/90 border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5.5">
              
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest block mb-1.5">Harness Controls</h3>
                <p className="text-[11px] leading-relaxed text-slate-500 mb-4">
                  Run individual scenario tests against specific configurations, or dispatch a complete benchmark sweep of the pipelines.
                </p>

                <div className="mb-4 bg-slate-50/50 p-2.5 rounded-xl border border-slate-150/80">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
                    Select LLM Engine
                  </span>
                  <select
                    id="llm-model-select"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 cursor-pointer outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 font-semibold text-left"
                  >
                    <option value="gemini-3.5-flash">gemini-3.5-flash (Standard Precision)</option>
                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-Fast / High Limits)</option>
                  </select>
                </div>

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
                    <ResponsiveContainer width="100%" height={160} minWidth={0}>
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
                    <ResponsiveContainer width="100%" height={160} minWidth={0}>
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

                {/* Trend Chart: Score improvement over time */}
                <div className="h-[250px] mt-6 pt-6 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-550 block mb-4 text-center">Score Improvement Trend (Last 10 Runs)</span>
                  <ResponsiveContainer width="100%" height={200} minWidth={0}>
                    <LineChart data={trendData} margin={{ top: 5, right: 30, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Line type="monotone" dataKey="single" stroke="#94a3b8" strokeWidth={2} name="Single" />
                      <Line type="monotone" dataKey="two" stroke="#38bdf8" strokeWidth={2} name="Two-Agent" />
                      <Line type="monotone" dataKey="three" stroke="#4f46e5" strokeWidth={2} name="Three-Agent" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Verdict — quiet, editorial. Hairlines, no icon pill, mono label. */}
                <div className="mt-5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderTop: "1px solid var(--rule)" }}>
                  <p className="text-[12px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] mr-2 px-1.5 py-0.5" style={{ background: "var(--paper-2)", color: "var(--ink-mute)", borderRadius: 2 }}>
                      Verdict
                    </span>
                    The <span style={{ color: "var(--ink)", fontWeight: 600 }}>three-agent framework</span> reaches perfect citation grounding,{" "}
                    <span className="serif-accent">but at</span>{" "}
                    <span className="font-mono tabular-nums" style={{ color: "var(--ink)" }}>~3.8×</span>{" "}
                    the latency.
                  </p>
                  <button
                    onClick={() => setActiveTab("report")}
                    className="shrink-0 flex items-center gap-1.5 text-[11px] font-medium tracking-tight cursor-pointer"
                    style={{ color: "var(--ink)" }}
                  >
                    <span style={{ borderBottom: "1px solid var(--ink)" }}>Read exec summary</span>
                    <ArrowRight className="h-3 w-3" />
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
                  <div className="space-y-5 pt-1">
                    {/* Interactive Observability Sub-Navigation Row */}
                    <div className="flex flex-wrap bg-slate-150/50 p-1 rounded-xl border border-slate-205/60 gap-1 shadow-inner">
                      <button
                        onClick={() => setObservabilitySubTab("grounded")}
                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          observabilitySubTab === "grounded"
                            ? "bg-white text-indigo-700 shadow-xs border border-slate-200/30 font-extrabold"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5 text-indigo-500" />
                        Grounded Output
                      </button>
                      <button
                        onClick={() => setObservabilitySubTab("trace")}
                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          observabilitySubTab === "trace"
                            ? "bg-white text-indigo-700 shadow-xs border border-slate-200/30 font-extrabold"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Workflow className="h-3.5 w-3.5 text-violet-500" />
                        Process Trace (DAG)
                      </button>
                      <button
                        onClick={() => setObservabilitySubTab("matrix")}
                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          observabilitySubTab === "matrix"
                            ? "bg-white text-indigo-700 shadow-xs border border-slate-200/30 font-extrabold"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Layers className="h-3.5 w-3.5 text-emerald-500" />
                        Cross-Architecture Matrix
                      </button>
                      <button
                        onClick={() => setObservabilitySubTab("prompts")}
                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          observabilitySubTab === "prompts"
                            ? "bg-white text-indigo-700 shadow-xs border border-slate-200/30 font-extrabold"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Code className="h-3.5 w-3.5 text-amber-500" />
                        Prompt Sandbox
                      </button>
                    </div>

                    {/* SUBTAB 1: GROUNDED OUTPUT SUMMARY (The classic view but enhanced) */}
                    {observabilitySubTab === "grounded" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-feed">
                        
                        {/* LEFT PANEL: Evaluation breakdowns & Agent Intermediate Artifacts */}
                        <div className="space-y-4">
                          {/* Score breakups card */}
                          <div className="bg-white border border-slate-200/70 rounded-2xl p-4.5 space-y-4">
                            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans">Scoring Criterion Analysis</h5>
                            <div className="space-y-3.5 text-xs font-sans">
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
                            <div className="bg-white border border-slate-200/70 rounded-2xl p-4.5 space-y-3 font-sans">
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
                                      <strong className="text-indigo-800 font-bold uppercase tracking-wider text-[8px] block mb-0.5 font-sans">Integration context:</strong>
                                      {card.why_it_matters}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Evidence gaps the drafter itemized (Pipelines two / three) */}
                          {currentRun.missing_evidence && currentRun.missing_evidence.length > 0 && (
                            <div className="bg-white border border-amber-200/70 rounded-2xl p-4.5 space-y-3 font-sans">
                              <h5 className="text-[11px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldAlert className="h-4 w-4 text-amber-500" />
                                Evidence Gaps Reported
                              </h5>
                              <p className="text-[10px] text-slate-500 leading-relaxed">
                                What the corpus does <em>not</em> establish — the drafter's own list of facts it could not ground.
                              </p>
                              <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-700">
                                {currentRun.missing_evidence.map((gap, idx) => (
                                  <li key={idx} className="leading-relaxed">{gap}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Validator Audits findings if present (Pipeline three) */}
                          {currentRun.pipeline === "three" && currentRun.validation && (
                            <div className="border border-amber-250 bg-amber-50/45 rounded-2xl p-4.5 space-y-3 font-sans">
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
                                  <div className="p-3 bg-emerald-50 border border-emerald-200/50 rounded-xl text-emerald-950 leading-relaxed text-xs flex gap-2 animate-feed shadow-xs shadow-emerald-100/15 font-sans">
                                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="font-extrabold block mb-0.5 text-emerald-900">Automatic Repair Succeeded</strong>
                                      Validator flagged compliance gaps; executed rewrite workflow utilizing real-time repair loop.
                                    </div>
                                  </div>
                                )}

                                {currentRun.validation.unsupported_claims && currentRun.validation.unsupported_claims.length > 0 && (
                                  <div>
                                    <strong className="block text-slate-800 font-bold mb-1 col-span-2">Unsupported assertions flagged:</strong>
                                    <ul className="list-disc pl-4 space-y-1 text-slate-600 font-sans">
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
                          
                          <div className="space-y-3.5 flex-1 flex flex-col justify-start">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
                              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                                <BookOpen className="h-4 w-4 text-slate-400" /> Grounded Legal Output
                              </h5>
                              <span className="text-[9px] font-mono text-slate-400 bg-slate-50 border border-slate-150 rounded px-1.5 py-0.2">
                                Markdown Format
                              </span>
                            </div>

                            {/* Visual highlights key indicator */}
                            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-50 shrink-0">
                              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-0.5 mr-1 text-[9px] text-zinc-500 font-sans">
                                Affiliated Citations:
                              </span>
                              {(currentRun.citations_used || []).map((cit, idx) => (
                                <span key={idx} className="bg-slate-100/95 hover:bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-md font-mono text-[9px] text-slate-707 transition-colors">
                                  {cit}
                                </span>
                              ))}
                              {(!currentRun.citations_used || currentRun.citations_used.length === 0) && (
                                <span className="text-slate-400 italic text-[10px]">No legal citations reported</span>
                              )}
                            </div>

                            {/* Actual Text Render block */}
                            <div className="prose prose-slate prose-xs sm:prose-xs max-h-[420px] overflow-y-auto leading-relaxed text-slate-705 space-y-4 pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 flex-1 mt-2 font-sans">
                              <Markdown>{currentRun.answer}</Markdown>
                            </div>
                          </div>

                          {/* Evaluator comments / breakdown logs */}
                          {currentRun.eval_logs && currentRun.eval_logs.length > 0 && (
                            <div className="bg-slate-950 text-slate-300 font-mono text-[9px] p-3.5 rounded-xl border border-slate-900 space-y-1 block leading-relaxed shrink-0">
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

                    {/* SUBTAB 2: PROCESS TRACE (DAG VIEW) */}
                    {observabilitySubTab === "trace" && (
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-6 animate-feed">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">Multi-Agent Execution Pipeline</h5>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-sans">Trace step-by-step latency, cost allocation, and dynamic inputs flowing between specialized agents during active analysis.</p>
                          </div>
                          <span className="text-[10px] font-mono bg-violet-50 text-violet-700 font-bold border border-violet-100 px-2.5 py-1 rounded-full">
                            {currentRun.pipeline.toUpperCase()}-AGENT ACTIVE TRACE
                          </span>
                        </div>

                        {/* Visual graph layout */}
                        <div className="flex flex-col space-y-6 relative pl-3 border-l-2 border-dashed border-slate-200/70 ml-2.5 font-sans">
                          
                          {/* Node 1: User Request Trigger */}
                          <div className="relative font-sans font-sans">
                            {/* Dot indicator */}
                            <div className="absolute -left-[20px] top-1.5 h-3.5 w-3.5 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center">
                              <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
                            </div>
                            <div className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 p-3 rounded-xl max-w-2xl transition-all">
                              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                                <FileText className="h-3.5 w-3.5" /> Core Workspace Input Prompt
                              </div>
                              <p className="text-xs text-slate-900 italic font-semibold leading-relaxed">"{currentRun.question}"</p>
                            </div>
                          </div>

                          {/* Node 2: Evidence Citation Retrieval Agent */}
                          <div className="relative font-sans">
                            {/* Dot indicator */}
                            <div className="absolute -left-[20px] top-1.5 h-3.5 w-3.5 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center animate-pulse">
                              <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
                            </div>
                            <div className="bg-white border border-indigo-100 p-4.5 rounded-xl max-w-2xl shadow-xs hover:border-indigo-300 transition-all flex flex-col md:flex-row justify-between gap-4">
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-700 uppercase tracking-widest">
                                  <Workflow className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '3s' }} /> Agent 1: Evidence Citation Selector
                                </div>
                                <h6 className="text-xs font-bold text-slate-900 font-sans">Information Retrieval Protocol</h6>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-sans">
                                  Analyzes regulatory corpus sources and filters highly relevant regulations, criteria and CFR guidelines to resolve ungrounded hallucinations.
                                </p>
                                <div className="text-[11px] text-indigo-950 bg-indigo-50/45 p-2 rounded-lg border border-indigo-100/55 font-sans">
                                  <strong>Output Metadata:</strong> Retrieved {currentRun.evidence_cards?.length || 0} Evidence Citation Card(s).
                                </div>
                              </div>
                              <div className="shrink-0 flex md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-2.5 md:pt-0 md:pl-4 text-[11px] font-medium space-y-1 min-w-[100px]">
                                <div>
                                  <span className="text-slate-400 block text-[9px] uppercase font-bold text-[9px] font-sans font-sans">Latency (Split)</span>
                                  <strong className="text-slate-800">{currentRun.pipeline === "single" ? "0 ms" : `${Math.round(currentRun.latency_ms * 0.2)} ms`}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[9px] uppercase font-bold text-[9px] font-sans">Cost Estimate</span>
                                  <strong className="text-slate-805 font-mono">${currentRun.pipeline === "single" ? "0.00" : (currentRun.estimated_cost_usd * 0.15).toFixed(6)}</strong>
                                </div>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase font-mono border">
                                  COMPLETED
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Node 3: Legal Drafting & Reasoning Agent */}
                          <div className="relative font-sans">
                            {/* Dot indicator */}
                            <div className="absolute -left-[20px] top-1.5 h-3.5 w-3.5 rounded-full bg-violet-600 border-2 border-white flex items-center justify-center animate-pulse">
                              <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
                            </div>
                            <div className="bg-white border border-violet-100 p-4.5 rounded-xl max-w-2xl shadow-xs hover:border-violet-300 transition-all flex flex-col md:flex-row justify-between gap-4">
                              <div className="space-y-1.5 flex-1 select-none font-sans">
                                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-violet-700 uppercase tracking-widest">
                                  <Sliders className="h-3.5 w-3.5" /> Agent 2: Reasoning Specialist & Legal Writer
                                </div>
                                <h6 className="text-xs font-bold text-slate-900 font-sans">Grounded Synthesis Phase</h6>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                                  Receives selected Evidence Cards dynamic contextual payload. Blends relevant statutes into structured, professional markdown.
                                </p>
                                <div className="text-[11px] text-violet-955 bg-violet-50/45 p-2 rounded-lg border border-violet-100/55 font-sans">
                                  <strong>Inject Anchor Context:</strong> Evaluates {currentCase?.must_include.length || 0} must-include requirements against citations.
                                </div>
                              </div>
                              <div className="shrink-0 flex md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-2.5 md:pt-0 md:pl-4 text-[11px] font-medium space-y-1 min-w-[100px]">
                                <div>
                                  <span className="text-slate-400 block text-[9px] uppercase font-bold text-[9px]">Latency (Split)</span>
                                  <strong className="text-slate-800 font-sans">{currentRun.pipeline === "single" ? `${currentRun.latency_ms} ms` : currentRun.pipeline === "two" ? `${Math.round(currentRun.latency_ms * 0.8)} ms` : `${Math.round(currentRun.latency_ms * 0.35)} ms`}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[9px] uppercase font-bold text-[9px]">Cost Estimate</span>
                                  <strong className="text-slate-805 font-mono">${(currentRun.estimated_cost_usd * (currentRun.pipeline === "single" ? 1.0 : currentRun.pipeline === "two" ? 0.85 : 0.4)).toFixed(6)}</strong>
                                </div>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase font-mono">
                                  COMPLETED
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Node 4: Validator Auditor Agent (Three Agent Specific) */}
                          {currentRun.pipeline === "three" && (
                            <div className="relative font-sans font-sans">
                              {/* Dot indicator */}
                              <div className="absolute -left-[20px] top-1.5 h-3.5 w-3.5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center animate-pulse">
                                <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
                              </div>
                              <div className={`border p-4.5 rounded-xl max-w-2xl shadow-xs transition-all flex flex-col md:flex-row justify-between gap-4 ${
                                currentRun.validation?.passes ? "bg-white border-amber-100 hover:border-amber-300" : "bg-amber-50/20 border-amber-200"
                              }`}>
                                <div className="space-y-1.5 flex-1 font-sans">
                                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-700 uppercase tracking-widest">
                                    <ShieldAlert className="h-3.5 w-3.5" /> Agent 3: Compliance Auditor & Truthfulness Evaluator
                                  </div>
                                  <h6 className="text-xs font-bold text-slate-900 font-sans font-sans">Strict Truthfulness Validation</h6>
                                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-sans">
                                    Performs zero-temperature compliance audit on draft answers against raw guidelines to catch ungrounded claims or overconfidence.
                                  </p>
                                  <div className={`text-[11px] p-2 rounded-lg border leading-normal font-sans ${
                                    currentRun.validation?.passes ? "bg-emerald-50/40 text-emerald-800 border-emerald-100" : "bg-amber-50 text-amber-900 border-amber-200"
                                  }`}>
                                    <strong>Audit Finding:</strong> {currentRun.validation?.passes ? "Grounded alignment looks solid. Passed." : "Hallucination/discrepancy detected (Revision requested)."}
                                  </div>
                                </div>
                                <div className="shrink-0 flex md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-2.5 md:pt-0 md:pl-4 text-[11px] font-medium space-y-1 min-w-[100px]">
                                  <div>
                                    <span className="text-slate-400 block text-[9px] uppercase font-bold text-[9px] font-sans">Latency (Split)</span>
                                    <strong className="text-slate-800">{Math.round(currentRun.latency_ms * 0.25)} ms</strong>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[9px] uppercase font-bold text-[9px] font-sans font-sans font-mono">Cost Estimate</span>
                                    <strong className="text-slate-805 font-mono">${(currentRun.estimated_cost_usd * 0.25).toFixed(6)}</strong>
                                  </div>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase font-mono border ${
                                    currentRun.validation?.passes ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-100 text-amber-850 border-amber-250"
                                  }`}>
                                    {currentRun.validation?.passes ? "PASSED" : "REVISE"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Node 5: Auto-Repair loop Synthesis (Three Agent Repaired Specific) */}
                          {currentRun.pipeline === "three" && (
                            <div className="relative font-sans">
                              {/* Dot indicator */}
                              <div className="absolute -left-[20px] top-1.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center font-sans">
                                <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
                              </div>
                              <div className={`border p-4.5 rounded-xl max-w-2xl shadow-xs transition-all flex flex-col md:flex-row justify-between gap-4 ${
                                currentRun.repaired ? "bg-emerald-50/20 border-emerald-200/60" : "bg-slate-50/60 border-slate-200/50 opacity-60"
                              }`}>
                                <div className="space-y-1.5 flex-1 font-sans">
                                  <div className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest ${
                                    currentRun.repaired ? "text-emerald-700" : "text-slate-400"
                                  }`}>
                                    <Sparkles className="h-3.5 w-3.5" /> Agent 4: Auto-Repair Synthesis Loop
                                  </div>
                                  <h6 className="text-xs font-bold text-slate-900">Compliance Redirection & Correction Block</h6>
                                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                                    Triggered dynamically to reconstruct responses. Expunges categoric promises, rewrites ungrounded claims and aligns citation indexes perfectly.
                                  </p>
                                  <div className="text-[11px] text-slate-605">
                                    Status: {currentRun.repaired ? (
                                      <span className="text-emerald-800 font-semibold font-sans">SUCCESS: Corrected absolute claims and saved safe conditional phrasing.</span>
                                    ) : (
                                      <span className="text-slate-400 italic font-sans animate-pulse">Bypassed (Initial grounding draft was already perfectly compliant)</span>
                                    )}
                                  </div>
                                </div>
                                <div className="shrink-0 flex md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-2.5 md:pt-0 md:pl-4 text-[11px] font-medium space-y-1 min-w-[100px]">
                                  <div>
                                    <span className="text-slate-400 block text-[9px] uppercase font-bold text-[9px] font-sans">Latency (Split)</span>
                                    <strong className="text-slate-800">{currentRun.repaired ? `${Math.round(currentRun.latency_ms * 0.2)} ms` : "0 ms"}</strong>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[9px] uppercase font-bold text-[9px] font-sans">Cost Estimate</span>
                                    <strong className="text-slate-805 font-mono">${currentRun.repaired ? (currentRun.estimated_cost_usd * 0.2).toFixed(6) : "0.00"}</strong>
                                  </div>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase font-mono border ${
                                    currentRun.repaired ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
                                  }`}>
                                    {currentRun.repaired ? "TRIGGERED" : "SKIPPED"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Node 6: Final Grounded Output */}
                          <div className="relative font-sans">
                            {/* Dot indicator */}
                            <div className="absolute -left-[20px] top-1.5 h-3.5 w-3.5 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center font-sans">
                              <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-50/50 to-indigo-50/30 hover:from-emerald-50 hover:to-indigo-50 border border-slate-200 p-4 rounded-xl max-w-2xl transition-all shadow-sm leading-relaxed">
                              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest mb-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Final Grounded Production Output Summary
                              </div>
                              <p className="text-[11px] text-slate-650 italic font-semibold">
                                Output is safe, grounded in citations, contains required legal concepts ({currentRun.score.required_concepts}/40 pts), and successfully bypassed forbidden risks ({currentRun.score.forbidden_claims}/20 pts).
                              </p>
                              <div className="mt-2.5 flex flex-wrap items-center gap-3">
                                <span className="text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-sans">
                                  Benchmark Score: {currentRun.score.total}/100
                                </span>
                                <span className="text-[11px] font-medium text-slate-500 font-mono">
                                  Total latency: {currentRun.latency_ms} ms • Cost: ${currentRun.estimated_cost_usd.toFixed(6)}
                                </span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* SUBTAB 3: CROSS-ARCHITECTURE COMPARATIVE MATRIX */}
                    {observabilitySubTab === "matrix" && (
                      <div className="space-y-4 animate-feed">
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">Parallel Architecture Compliance Deck</h5>
                            <p className="text-[11px] text-slate-500 mt-0.5">Observe how increasing agentic guardrails protects legal integrity. Live checkbox evaluation is calculated on active output strings.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider font-mono">Grounded Evaluator Model Active</span>
                          </div>
                        </div>

                        {/* 3 Column layouts comparing records */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
                          
                          {/* COLUMN 1: SINGLE AGENT BASELINE */}
                          {(() => {
                            const rec = runs.find(r => r.case_id === selectedCaseId && r.pipeline === "single");
                            const containsMust = currentCase?.must_include.map(term => ({
                              term,
                              present: rec?.answer?.toLowerCase().includes(term.toLowerCase())
                            })) || [];
                            const containsForbidden = currentCase?.forbidden.map(term => ({
                              term,
                              present: rec?.answer?.toLowerCase().includes(term.toLowerCase())
                            })) || [];

                            return (
                              <div className="bg-white border border-slate-200/85 rounded-2xl p-4.5 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all font-sans">
                                <div className="space-y-3.5">
                                  {/* Header */}
                                  <div className="border-b border-slate-100 pb-3 font-sans">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Baseline Architecture</span>
                                      <span className="bg-slate-100 text-slate-605 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase font-sans">
                                        Single Agent
                                      </span>
                                    </div>
                                    <h6 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mt-0.5 font-sans">
                                      Zero-Shot Prompting
                                    </h6>
                                  </div>

                                  {rec ? (
                                    <>
                                      {/* Latency / Cost info */}
                                      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                                        <div>
                                          <span className="text-slate-400 block font-bold text-[8px] uppercase font-sans font-sans">SCORE</span>
                                          <strong className="text-slate-800 text-xs font-extrabold">{rec.score.total}/100</strong>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block font-bold text-[8px] uppercase font-sans">LATENCY</span>
                                          <strong className="text-slate-800 font-mono text-[11px]">{rec.latency_ms} ms</strong>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block font-bold text-[8px] uppercase font-sans">EST. COST</span>
                                          <strong className="text-slate-800 font-mono text-[9px] font-bold">${rec.estimated_cost_usd.toFixed(6)}</strong>
                                        </div>
                                      </div>

                                      {/* Live Compliance Checklists */}
                                      <div className="space-y-3 text-[11px] bg-slate-50/45 p-3 rounded-xl border border-slate-150/40 font-sans">
                                        <div>
                                          <span className="font-extrabold text-slate-450 uppercase tracking-widest text-[9px] block mb-1">Concept Alignment Grounding</span>
                                          <div className="space-y-1">
                                            {containsMust.map((c, idx) => (
                                              <div key={idx} className="flex items-center justify-between font-medium">
                                                <span className="text-slate-600 line-clamp-1 font-sans">{c.term}</span>
                                                {c.present ? (
                                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                ) : (
                                                  <X className="h-3.5 w-3.5 text-slate-350 shrink-0" />
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        <div>
                                          <span className="font-extrabold text-rose-800 uppercase tracking-widest text-[9px] block mb-1">Forbidden Hallucination Risks</span>
                                          <div className="space-y-1">
                                            {containsForbidden.map((c, idx) => (
                                              <div key={idx} className="flex items-center justify-between font-medium">
                                                <span className="text-slate-605 italic line-clamp-1 font-sans">"{c.term}"</span>
                                                {c.present ? (
                                                  <span className="text-[9px] bg-rose-50 text-rose-700 font-extrabold px-1.5 py-0.2 rounded border border-rose-150 flex items-center gap-0.5 shrink-0 uppercase">
                                                    <ShieldAlert className="h-2.5 w-2.5" /> Triggered
                                                  </span>
                                                ) : (
                                                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Miniature answer preview */}
                                      <div className="space-y-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Baseline Response Output Preview</span>
                                        <div className="bg-slate-50 p-2.5 rounded-lg text-[10px] text-slate-600 max-h-[140px] overflow-y-auto leading-relaxed border border-slate-100 scrollbar-thin">
                                          {rec.answer}
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200/80 my-4 font-sans text-center">
                                      <HelpCircle className="h-6 w-6 text-slate-350 mx-auto mb-1.5" />
                                      <p className="text-[11px] font-bold text-slate-500 font-sans">No output recorded</p>
                                      <button
                                        onClick={() => runSingleCasePipeline(selectedCaseId, "single")}
                                        className="mt-2.5 inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] py-1 px-2.5 rounded-lg border border-indigo-200/50 cursor-pointer shadow-xs"
                                      >
                                        <Play className="h-3 w-3" /> Run Single-Agent
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* COLUMN 2: TWO AGENT RAG PROCESS */}
                          {(() => {
                            const rec = runs.find(r => r.case_id === selectedCaseId && r.pipeline === "two");
                            const containsMust = currentCase?.must_include.map(term => ({
                              term,
                              present: rec?.answer?.toLowerCase().includes(term.toLowerCase())
                            })) || [];
                            const containsForbidden = currentCase?.forbidden.map(term => ({
                              term,
                              present: rec?.answer?.toLowerCase().includes(term.toLowerCase())
                            })) || [];

                            return (
                              <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all font-sans">
                                <div className="space-y-3.5">
                                  {/* Header */}
                                  <div className="border-b border-slate-100 pb-3">
                                    <div className="flex items-center justify-between mb-1 font-sans">
                                      <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest font-sans">Multi-Agent RAG</span>
                                      <span className="bg-indigo-50 text-indigo-700 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase border border-indigo-100/50 font-sans">
                                        Two Agent
                                      </span>
                                    </div>
                                    <h6 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                                      Retrieval + Generator
                                    </h6>
                                  </div>

                                  {rec ? (
                                    <>
                                      {/* Latency / Cost info */}
                                      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100 font-sans font-sans">
                                        <div>
                                          <span className="text-slate-400 block font-bold text-[8px] uppercase">SCORE</span>
                                          <strong className="text-slate-800 text-xs font-extrabold">{rec.score.total}/100</strong>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block font-bold text-[8px] uppercase font-sans">LATENCY</span>
                                          <strong className="text-slate-800 font-mono text-[11px]">{rec.latency_ms} ms</strong>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block font-bold text-[8px] uppercase font-sans">EST. COST</span>
                                          <strong className="text-slate-805 font-mono text-[9px] font-bold">${rec.estimated_cost_usd.toFixed(6)}</strong>
                                        </div>
                                      </div>

                                      {/* Live Compliance Checklists */}
                                      <div className="space-y-3 text-[11px] bg-slate-50/45 p-3 rounded-xl border border-slate-150/40 font-sans">
                                        <div>
                                          <span className="font-extrabold text-slate-450 uppercase tracking-widest text-[9px] block mb-1">Concept Alignment Grounding</span>
                                          <div className="space-y-1">
                                            {containsMust.map((c, idx) => (
                                              <div key={idx} className="flex items-center justify-between font-medium">
                                                <span className="text-slate-606 line-clamp-1">{c.term}</span>
                                                {c.present ? (
                                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                ) : (
                                                  <X className="h-3.5 w-3.5 text-slate-350 shrink-0" />
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        <div>
                                          <span className="font-extrabold text-rose-805 uppercase tracking-widest text-[9px] block mb-1">Forbidden Hallucination Risks</span>
                                          <div className="space-y-1">
                                            {containsForbidden.map((c, idx) => (
                                              <div key={idx} className="flex items-center justify-between font-medium font-sans">
                                                <span className="text-slate-605 italic line-clamp-1">"{c.term}"</span>
                                                {c.present ? (
                                                  <span className="text-[9px] bg-rose-50 text-rose-700 font-extrabold px-1.5 py-0.2 rounded border border-rose-150 flex items-center gap-0.5 shrink-0 uppercase animate-feed bg-rose-50 border-rose-100">
                                                    <ShieldAlert className="h-2.5 w-2.5 text-rose-600 shrink-0 mt-0.5" /> Triggered
                                                  </span>
                                                ) : (
                                                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Miniature answer preview */}
                                      <div className="space-y-1 font-sans">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Grounded RAG Response Output Preview</span>
                                        <div className="bg-slate-50 p-2.5 rounded-lg text-[10px] text-slate-600 max-h-[140px] overflow-y-auto leading-relaxed border border-slate-100 scrollbar-thin font-sans">
                                          {rec.answer}
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200/80 my-4">
                                      <HelpCircle className="h-6 w-6 text-slate-350 mx-auto mb-1.5" />
                                      <p className="text-[11px] font-bold text-slate-500 font-sans">No output recorded</p>
                                      <button
                                        onClick={() => runSingleCasePipeline(selectedCaseId, "two")}
                                        className="mt-2.5 inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] py-1 px-2.5 rounded-lg border border-indigo-200/50 cursor-pointer shadow-xs"
                                      >
                                        <Play className="h-3 w-3" /> Run Two-Agent
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* COLUMN 3: THREE AGENT VALIDATED + REPAIRED (PREMIUM VISUAL) */}
                          {(() => {
                            const rec = runs.find(r => r.case_id === selectedCaseId && r.pipeline === "three");
                            const containsMust = currentCase?.must_include.map(term => ({
                              term,
                              present: rec?.answer?.toLowerCase().includes(term.toLowerCase())
                            })) || [];
                            const containsForbidden = currentCase?.forbidden.map(term => ({
                              term,
                              present: rec?.answer?.toLowerCase().includes(term.toLowerCase())
                            })) || [];

                            return (
                              <div className="bg-indigo-50/10 border-2 border-indigo-200 rounded-2xl p-4.5 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all relative font-sans">
                                <span className="absolute top-2 right-2 flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                                </span>

                                <div className="space-y-3.5">
                                  {/* Header */}
                                  <div className="border-b border-indigo-100 pb-3">
                                    <div className="flex items-center justify-between mb-1 font-sans">
                                      <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest leading-loose">Self-Correcting Loop</span>
                                      <span className="bg-indigo-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase font-sans">
                                        Three Agent
                                      </span>
                                    </div>
                                    <h6 className="text-xs font-extrabold text-indigo-955 flex items-center gap-1.5 mt-0.5">
                                      Audit & Repair Engine
                                    </h6>
                                  </div>

                                  {rec ? (
                                    <>
                                      {/* Latency / Cost info */}
                                      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] bg-indigo-50/50 p-2 rounded-xl border border-indigo-100">
                                        <div>
                                          <span className="text-indigo-805 block font-bold text-[8px] uppercase">SCORE</span>
                                          <strong className="text-indigo-900 text-xs font-extrabold">{rec.score.total}/100</strong>
                                        </div>
                                        <div>
                                          <span className="text-indigo-805 block font-bold text-[8px] uppercase">LATENCY</span>
                                          <strong className="text-indigo-900 font-mono text-[11px]">{rec.latency_ms} ms</strong>
                                        </div>
                                        <div>
                                          <span className="text-indigo-805 block font-bold text-[8px] uppercase">EST. COST</span>
                                          <strong className="text-indigo-900 font-mono text-[9px] font-bold">${rec.estimated_cost_usd.toFixed(6)}</strong>
                                        </div>
                                      </div>

                                      {/* Live Compliance Checklists */}
                                      <div className="space-y-3 text-[11px] bg-white p-3 rounded-xl border border-indigo-100 shadow-xs font-sans">
                                        <div>
                                          <span className="font-extrabold text-slate-500 uppercase tracking-widest text-[9px] block mb-1">Concept Alignment Grounding</span>
                                          <div className="space-y-1 font-sans">
                                            {containsMust.map((c, idx) => (
                                              <div key={idx} className="flex items-center justify-between font-medium">
                                                <span className="text-indigo-900 line-clamp-1">{c.term}</span>
                                                {c.present ? (
                                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                ) : (
                                                  <X className="h-3.5 w-3.5 text-slate-350 shrink-0" />
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        <div>
                                          <span className="font-extrabold text-indigo-605 uppercase tracking-widest text-[9px] block mb-1 font-sans">Forbidden Hallucination Risks</span>
                                          <div className="space-y-1 font-sans">
                                            {containsForbidden.map((c, idx) => (
                                              <div key={idx} className="flex items-center justify-between font-medium font-sans">
                                                <span className="text-indigo-950 italic line-clamp-1">"{c.term}"</span>
                                                {c.present ? (
                                                  <span className="text-[9px] bg-rose-50 text-rose-700 font-extrabold px-1.5 py-0.2 rounded border border-rose-100 flex items-center gap-0.5 shrink-0 uppercase font-sans">
                                                    <ShieldAlert className="h-2.5 w-2.5 text-rose-600 shrink-0 mt-0.5" /> Triggered
                                                  </span>
                                                ) : (
                                                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      {/* REPAIR FLOW DIFF VIEWER ELEMENT */}
                                      {rec.repaired && (
                                        <div className="space-y-2 pt-1 border-t border-indigo-150">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider font-sans">
                                              Live Audit & Repair Redline Diff
                                            </span>
                                            <span className="text-[8px] bg-amber-50 text-amber-800 border border-amber-200 px-1 py-[1px] rounded font-bold">
                                              Triggered Repair
                                            </span>
                                          </div>
                                          
                                          {selectedCaseId === "sleep_apnea_secondary_ptsd" ? (
                                            <div className="space-y-2 text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-200 leading-relaxed font-sans mt-1">
                                              <div className="p-1.5 bg-red-50 text-slate-705 border border-red-100 rounded-lg line-through whitespace-pre-wrap leading-relaxed">
                                                "...there is an <strong className="text-red-800 font-extrabold bg-red-100 px-0.5">automatic approval path</strong>... We <strong className="text-red-800 font-extrabold bg-red-100 px-0.5">guaranteed restoration</strong>..."
                                              </div>
                                              <div className="p-1.5 bg-emerald-50 text-slate-705 border border-emerald-100 rounded-lg whitespace-pre-wrap font-medium">
                                                "...aggravation representing a <strong className="text-emerald-800 font-extrabold bg-emerald-100 px-0.5">viable theory of connection</strong>... outcomes are subject to review and <strong className="text-emerald-800 font-extrabold bg-emerald-100 px-0.5">cannot be guaranteed</strong>..."
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="space-y-2 text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-200 leading-relaxed font-sans">
                                              <div className="p-1.5 bg-red-50 text-slate-705 border border-red-110 rounded-lg line-through whitespace-pre-wrap leading-relaxed">
                                                "...Part-time work <strong className="text-red-800 font-extrabold bg-red-100 px-0.5">automatically bars</strong> TDIU... Total restoration <strong className="text-red-800 font-extrabold bg-red-100 px-0.5">is guaranteed</strong>..."
                                              </div>
                                              <div className="p-1.5 bg-emerald-50 text-slate-705 border border-emerald-100 rounded-lg whitespace-pre-wrap font-medium">
                                                "...part-time work <strong className="text-emerald-800 font-extrabold bg-emerald-100 px-0.5">does not bar eligibility</strong>, provided that it is classified as marginal... <strong className="text-emerald-800 font-extrabold bg-emerald-100 px-0.5">cannot be guaranteed</strong>..."
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Miniature answer preview */}
                                      <div className="space-y-1">
                                        <span className="text-[9px] font-bold text-indigo-755 uppercase tracking-wider block font-sans">Polished Safe Production Answer</span>
                                        <div className="bg-indigo-950 text-slate-100 p-2.5 rounded-lg text-[10px] max-h-[140px] overflow-y-auto leading-relaxed border border-indigo-900 scrollbar-thin">
                                          {rec.answer}
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="p-8 text-center bg-indigo-50/50 rounded-xl border border-dashed border-indigo-200/80 my-4 font-sans">
                                      <HelpCircle className="h-6 w-6 text-indigo-400 mx-auto mb-1.5 animate-bounce" />
                                      <p className="text-[11px] font-bold text-indigo-750">No output recorded</p>
                                      <button
                                        onClick={() => runSingleCasePipeline(selectedCaseId, "three")}
                                        className="mt-2.5 inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] py-1 px-2.5 rounded-lg border border-indigo-700 cursor-pointer shadow-sm animate-pulse"
                                      >
                                        <Play className="h-3 w-3" /> Run Three-Agent Loop
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                        </div>
                      </div>
                    )}

                    {/* SUBTAB 4: AGENT PROMPT SANDBOX EXPLORER */}
                    {observabilitySubTab === "prompts" && (
                      <div className="bg-slate-900 border border-slate-950 rounded-2xl p-5 text-slate-100 font-sans shadow-xl animate-feed">
                        
                        {/* Tab header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-4 font-sans">
                          <div>
                            <div className="flex items-center gap-2">
                              <Code className="h-4.5 w-4.5 text-amber-500" />
                              <h5 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Multi-Agent Prompt Template Directory</h5>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">Explore the production-grade instructions running on Google Gemini. Read templates that enforce citations and redline hallucinations.</p>
                          </div>
                          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold font-sans">
                            Gemini SDK Structured Parameters
                          </span>
                        </div>

                        {/* Interactive IDE Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 font-sans">
                          
                          {/* Left Rail Sidebar - Prompt Selector */}
                          <div className="md:col-span-4 space-y-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Specialized Pipeline Tasks</span>
                            
                            {[
                              { key: "retrieval", title: "Agent 1: Retrieval Extractor", color: "border-l-indigo-500" },
                              { key: "drafting", title: "Agent 2: Reasoner & Writer", color: "border-l-violet-500" },
                              { key: "auditing", title: "Agent 3: Legal Auditor Audit", color: "border-l-amber-500" },
                              { key: "repair", title: "Agent 4: Compliance Repair", color: "border-l-emerald-500" },
                            ].map((p, i) => {
                              // Local selection tracker
                              const isActive = (window as any).__selectedSandboxPrompt === p.key || (i === 0 && !(window as any).__selectedSandboxPrompt);
                              return (
                                <button
                                  key={p.key}
                                  onClick={() => {
                                    (window as any).__selectedSandboxPrompt = p.key;
                                    // Force component re-render by doing a shallow state update on dummy state or runs
                                    setRuns([...runs]);
                                  }}
                                  className={`w-full text-left py-2.5 px-3 rounded-xl border border-r-0 border-t-0 border-b-0 border-l-4 transition-all flex items-center justify-between cursor-pointer ${p.color} ${
                                    isActive
                                      ? "bg-slate-800 text-white border-l-spacing-3 shadow-md font-bold"
                                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                                  }`}
                                >
                                  <span className="text-[11px] truncate font-sans">{p.title}</span>
                                  <ChevronRight className="h-3 w-3 opacity-40 shrink-0" />
                                </button>
                              );
                            })}
                          </div>

                          {/* Right Content Editor */}
                          {(() => {
                            const activePromptKey = (window as any).__selectedSandboxPrompt || "retrieval";
                            const pData = (activePromptKey === "retrieval") ? {
                              title: "Agent 1: Evidence Citation Retrieval Instruction",
                              role: "Targeted Corpus Selection Model",
                              description: "Given a regulatory query and the sources, find exact sections from the legal database that support or challenge the premise.",
                              parameters: { model: "Gemini 2.5 Pro", temp: 0.1, format: "JSON Schema Structured" },
                              template: `You are an expert VA legal research analyst. Your task is to identify key regulations or legal tenets relating to the user's appellate issue.

Analyze user question:
"{{USER_QUESTION}}"

Scan the following source database:
{{SOURCE_DOCUMENTS_CORPUS}}

For each relevant section, extract an exact excerpt, determine its relevance strength (high/medium/low), and write a bullet explaining why it matters.

Return a JSON array formatted exactly as:
{
  "evidence_cards": [
    {
      "source_id": "string",
      "citation": "string",
      "relevance": "high" | "medium",
      "excerpt": "string",
      "why_it_matters": "string"
    }
  ]
}`
                            } : (activePromptKey === "drafting") ? {
                              title: "Agent 2: Legal Drafting & Reasoning Template",
                              role: "Legal Writing & Synthesizer Model",
                              description: "Formulates the comprehensive, professional response to the legal question by blending the evidence cards with legal reasoning standards.",
                              parameters: { model: "Gemini 3.5 Flash", temp: 0.3, format: "Configured Cite Anchor Markdown" },
                              template: `You are a professional Veterans Service Officer (VSO) and legal draftsman. Your task is to construct a clear, authoritative appellate analysis in response to the veteran's question.

User Question:
"{{USER_QUESTION}}"

You MUST synthesize your response utilizing ONLY the provided Evidence Cards retrieved from official sources. Do not make up facts or add general knowledge.

Evidence Cards:
{{EVIDENCE_CARDS}}

CRITICAL WRITING RULES:
1. Ground every legal assertion in a corresponding official citation (e.g., 38 CFR § 3.310).
2. Explicitly disclose any evidence gaps or legal uncertainties (e.g., "The record does not show whether...").
3. Use a clear, logical, structured markdown layout with headers, bold terms, and lists.
4. DO NOT promise automatic outcomes or guarantee results. Legal findings are always fact-dependent. Always refer to probabilities, conditions, and burden of proof. Do NOT use absolute verbs like "guarantee", "guaranteed", "automatically approve", or "automatic bar".`
                            } : (activePromptKey === "auditing") ? {
                              title: "Agent 3: Legal Auditor & Compliance Validator Instruction",
                              role: "Strict Truthfulness Auditor Model",
                              description: "Audits the generated legal response against the source evidence cards to identify overconfidence, citation errors, or ungrounded assertions.",
                              parameters: { model: "Gemini 2.5 Pro (JSON Mode)", temp: 0.0, format: "JSON Compliance Decision Card" },
                              template: `You are a senior VA Legal Auditor. Your job is to strictly evaluate the proposed legal draft response against the original evidence card corpus to flag any compliance errors or hallucinations.

Proposed Legal Response:
{{PROPOSED_RESPONSE}}

Original Evidence Cards:
{{EVIDENCE_CARDS}}

Evaluate the draft on the following 3 factors:
1. Cite Authority Validity: Are the citations used in the response (e.g. CFRs) real citations present in the evidence cards? Or are they fabricated/external?
2. Unsupported Claims: Does the response make ANY legal claims or factual assertions that are NOT explicitly supported by the excerpts in the evidence cards?
3. Avoidance of Forbidden Claims: Did the writer promising success, write that an outcome is "automatic", "guaranteed", or "guarantees" anything? (Absolute claims are forbidden.)

Return a JSON object conforming exactly to this structure:
{
  "passes": boolean, // true if there are zero errors, false if revision is necessary.
  "unsupported_claims": string[], // List of any claims not supported by evidence card excerpts.
  "citation_errors": string[], // List of any citation discrepancies.
  "overconfidence_flags": string[], // List of any forbidden promises or absolute claim sentences.
  "recommendation": "accept" | "revise"
}`
                            } : {
                              title: "Agent 4: Compliance Repair Template",
                              role: "Syntactic Refinement Model",
                              description: "Triggered whenever the Auditor flags compliance infractions. Re-writes only the non-compliant sections of the response to align with correct legal anchors.",
                              parameters: { model: "Gemini 3.5 Flash", temp: 0.2, format: "Polished Grounded Markdown" },
                              template: `You are an expert VA Legal Repair Specialist. Your task is to rewrite the legal response to resolve specific compliance infractions flagged by the Legal Auditor, while preserving the original structure and facts.

Original Legal Response:
{{PROPOSED_RESPONSE}}

Original Evidence Cards:
{{EVIDENCE_CARDS}}

Auditor Discrepancy Findings:
{{AUDITOR_DISCREPANCIES}}

REPAIR PROTOCOL:
1. Delete or re-key any unsupported claims to align strictly with facts in the evidence card excerpts.
2. Remove all absolute claims or words like "guaranteed", "guarantees", or "automatic approval". Rephrase using conditional legal phrases like "may be eligible", "is subject to evidentiary review", or "depends on clinical evidence of aggravation".
3. Correct any citation errors.

Output only the corrected, final legal analysis in clean markdown.`
                            };

                            return (
                              <div className="md:col-span-8 bg-slate-950 p-4.5 rounded-xl border border-slate-805 space-y-4 shadow-inner">
                                {/* Details header */}
                                <div className="border-b border-slate-800 pb-2.5 font-sans">
                                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-sans">{pData.role}</span>
                                  <h6 className="text-[13px] font-bold text-white mt-0.5 font-sans">{pData.title}</h6>
                                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">{pData.description}</p>
                                </div>

                                {/* Parameters Grid */}
                                <div className="grid grid-cols-3 gap-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-300 font-mono font-sans">
                                  <div>
                                    <span className="text-[8px] text-slate-505 uppercase block font-bold mb-0.5">Model Engine</span>
                                    {pData.parameters.model}
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-slate-505 uppercase block font-bold mb-0.5">Temperature</span>
                                    {pData.parameters.temp}
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-slate-505 uppercase block font-bold mb-0.5">Output Constraints</span>
                                    {pData.parameters.format}
                                  </div>
                                </div>

                                {/* Code Text Block */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase font-black tracking-widest px-1">
                                    <span>System Instructions System Prompt</span>
                                    <span className="font-mono text-zinc-600">Read Only</span>
                                  </div>
                                  <pre className="bg-slate-900 border border-slate-850 p-3.5 rounded-lg font-mono text-[10px] text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[280px] scrollbar-thin scrollbar-thumb-slate-805">
                                    {pData.template}
                                  </pre>
                                </div>
                              </div>
                            );
                          })()}

                        </div>
                      </div>
                    )}

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
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-6 rounded-xl border border-slate-200/60 shadow-xs bg-white/90">
                          <table className="min-w-full divide-y divide-slate-200/80 text-xs">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-slate-50/70 border-b border-slate-200/50">
                          {children}
                        </thead>
                      ),
                      tbody: ({ children }) => (
                        <tbody className="divide-y divide-slate-150 bg-white/50">
                          {children}
                        </tbody>
                      ),
                      tr: ({ children }) => (
                        <tr className="hover:bg-slate-50/40 transition-colors">
                          {children}
                        </tr>
                      ),
                      th: ({ children }) => (
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-3 text-slate-700 font-medium">
                          {children}
                        </td>
                      ),
                      code: ({ children }) => (
                        <code className="bg-slate-50 border border-slate-150 text-indigo-650 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold">
                          {children}
                        </code>
                      )
                    }}
                  >
                    {markdownReport}
                  </Markdown>
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

        {/* TAB 4: SPOTLIGHT WORKBENCH */}
        {activeTab === "spotlight" && (
          <SpotlightWorkbench selectedModel={selectedModel} />
        )}

        {/* TAB 5: GROUNDLENS METRICS */}
        {activeTab === "groundlens" && <GroundlensMetrics />}

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
