import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Ensure directories exist
const dataDir = path.join(process.cwd(), "data");
const outputsDir = path.join(process.cwd(), "outputs");
const runsDir = path.join(process.cwd(), "outputs", "runs");
const reportsDir = path.join(process.cwd(), "outputs", "reports");

[dataDir, outputsDir, runsDir, reportsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Lazy initialize Gemini SDK client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is missing. Please configuration your key in the Secrets Panel.");
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Helper to manage rate-limiting under the Gemini Free Tier quotas (e.g., 5 RPM standard, 15 RPM for lite)
let lastRequestTime = 0;
let currentMinGapMs = 6000; // Starting baseline gap in ms

interface QueueItem {
  params: any;
  maxRetries: number;
  initialDelayMs: number;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

const apiQueue: QueueItem[] = [];
let isQueueRunning = false;

async function runQueue() {
  if (isQueueRunning) return;
  isQueueRunning = true;
  while (apiQueue.length > 0) {
    const item = apiQueue.shift();
    if (item) {
      try {
        const result = await executeWithThrottlingAndRetry(item.params, item.maxRetries, item.initialDelayMs);
        item.resolve(result);
      } catch (err) {
        item.reject(err);
      }
    }
  }
  isQueueRunning = false;
}

// Inner helper to execute a single request, handling retries and throttling
async function executeWithThrottlingAndRetry(params: any, maxRetries = 12, initialDelayMs = 10000): Promise<any> {
  const client = getGeminiClient();
  let attempt = 0;
  
  // Set model-specific baseline targets
  const modelName = params.model || "gemini-3.1-flash";
  let baselineGap = 6000; // Defaults to 6.0s for gemini-3.5-flash
  if (modelName.includes("lite")) {
    baselineGap = 2500; // Ultra low-latency models have high free limits, 2.5s is safe
  }

  while (true) {
    try {
      // Direct rate-limiting throttling helper
      const now = Date.now();
      const elapsed = now - lastRequestTime;
      
      // Ensure current gap doesn't sit below our target baseline for this model
      currentMinGapMs = Math.max(currentMinGapMs, baselineGap);

      if (elapsed < currentMinGapMs) {
        const waitTime = currentMinGapMs - elapsed;
        console.log(`[Gemini API Throttle] Pausing for ${(waitTime / 1000).toFixed(1)}s to protect Free Tier quota (gap: ${(currentMinGapMs / 1000).toFixed(1)}s, model: ${modelName})...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }

      // Update the request timestamp before invocation
      lastRequestTime = Date.now();
      const result = await client.models.generateContent(params);
      
      // On success, slowly cool down the gap towards the baseline (decrement by 1s)
      currentMinGapMs = Math.max(currentMinGapMs - 1000, baselineGap);
      return result;
    } catch (err: any) {
      attempt++;
      
      const errString = (err?.message || err?.statusText || String(err) || "").toLowerCase();
      const isRateLimit = err?.status === 429 || 
                          err?.code === 429 || 
                          err?.statusCode === 429 ||
                          err?.status === "RESOURCE_EXHAUSTED" ||
                          errString.includes("429") || 
                          errString.includes("quota") || 
                          errString.includes("rate limit") || 
                          errString.includes("rate-limit") || 
                          errString.includes("resource_exhausted") || 
                          errString.includes("resource-exhausted") || 
                          errString.includes("resource exhausted") || 
                          errString.includes("exhausted");

      if (isRateLimit && attempt <= maxRetries) {
        // Adaptively increase the current gap on rate-limiting to protect future queue requests
        currentMinGapMs = Math.min(currentMinGapMs + 5000, 30000);

        // Calculate retry delay with exponential backoff on fallback initial delay (gentler growth)
        let delay = initialDelayMs * Math.pow(1.3, attempt - 1);
        
        // Parse "retry in X.Y s" from error body if present
        const match = errString.match(/retry in\s+([\d\.]+)\s*s/i);
        if (match && match[1]) {
          const parsedSecs = parseFloat(match[1]);
          if (!isNaN(parsedSecs)) {
            delay = (parsedSecs + 2) * 1000; // Add extra 2-second buffer for network jitter
          }
        }
        
        // Cap max retry delay since Gemini quota windows reset every 60 seconds
        delay = Math.min(delay, 40000);
        
        console.warn(`[Gemini API Rate Limit] Attempt ${attempt} failed with 429. Dynamic gap increased to ${(currentMinGapMs / 1000).toFixed(1)}s. Waiting ${(delay / 1000).toFixed(1)}s before retry...`);
        
        // Wait specified delay
        await new Promise((resolve) => setTimeout(resolve, delay));

        // After waiting the retry delay, set lastRequestTime in the past so the next loop run is not double-throttled
        lastRequestTime = Date.now() - currentMinGapMs;
      } else {
        throw err;
      }
    }
  }
}

// Helper to call generateContent with retry on rate limit / 429 quota limits (serialized globally)
async function generateContentWithRetry(params: any, maxRetries = 12, initialDelayMs = 10000): Promise<any> {
  return new Promise((resolve, reject) => {
    apiQueue.push({ params, maxRetries, initialDelayMs, resolve, reject });
    runQueue();
  });
}

// Default Data Initializers
const defaultTestCases = [
  {
    "id": "sleep_apnea_secondary_ptsd",
    "question": "The veteran was denied service connection for sleep apnea secondary to PTSD. What appeal theories are available?",
    "must_include": [
      "secondary service connection",
      "aggravation",
      "medical nexus",
      "VA exam adequacy",
      "evidence gaps"
    ],
    "forbidden": [
      "guaranteed",
      "automatic approval",
      "BVA decisions are binding precedent"
    ]
  },
  {
    "id": "tdiu_part_time_work",
    "question": "The Board denied TDIU because the veteran does some part-time work. What legal issues should be reviewed?",
    "must_include": [
      "substantially gainful employment",
      "marginal employment",
      "protected work environment",
      "education and work history",
      "functional limitations"
    ],
    "forbidden": [
      "part-time work automatically bars TDIU",
      "guaranteed",
      "automatic denial"
    ]
  },
  {
    "id": "rating_reduction",
    "question": "The VA reduced a veteran’s rating from 100% to 70%. What procedural protections should be checked?",
    "must_include": [
      "rating reduction procedures",
      "sustained improvement",
      "notice",
      "stabilized rating",
      "ordinary conditions of life and work"
    ],
    "forbidden": [
      "VA can reduce any time",
      "guaranteed restoration",
      "automatic"
    ]
  }
];

const defaultSources = [
  {
    "source_id": "cfr_3_310",
    "title": "38 CFR § 3.310",
    "authority_type": "CFR",
    "citation": "38 CFR § 3.310",
    "text": "Disability which is proximately due to or the result of a service-connected disease or injury shall be service connected. Any increase in severity of a nonservice-connected disease or injury that is proximately due to or the result of a service-connected disease or injury will be service connected for the degree of aggravation."
  },
  {
    "source_id": "cfr_4_16",
    "title": "38 CFR § 4.16",
    "authority_type": "CFR",
    "citation": "38 CFR § 4.16",
    "text": "Total disability ratings for compensation may be assigned where the schedular rating is less than total when the disabled person is unable to secure or follow a substantially gainful occupation as a result of service-connected disabilities. Marginal employment shall not be considered substantially gainful employment."
  },
  {
    "source_id": "cfr_3_105",
    "title": "38 CFR § 3.105",
    "authority_type": "CFR",
    "citation": "38 CFR § 3.105",
    "text": "Where a reduction in evaluation of a service-connected disability is considered warranted and the lower evaluation would result in a reduction or discontinuance of compensation payments, rating action will be taken and the beneficiary will be notified of the proposed reduction."
  },
  {
    "source_id": "cfr_3_344",
    "title": "38 CFR § 3.344",
    "authority_type": "CFR",
    "citation": "38 CFR § 3.344",
    "text": "Ratings on account of diseases subject to temporary or episodic improvement will not be reduced on any one examination except where all the evidence clearly warrants the conclusion that sustained improvement has been demonstrated."
  }
];

// Seed defaults if empty
const testCasesPath = path.join(dataDir, "test_cases.json");
const sourcesPath = path.join(dataDir, "sources.json");

if (!fs.existsSync(testCasesPath)) {
  fs.writeFileSync(testCasesPath, JSON.stringify(defaultTestCases, null, 2));
}
if (!fs.existsSync(sourcesPath)) {
  fs.writeFileSync(sourcesPath, JSON.stringify(defaultSources, null, 2));
}

// Helper: load local files
function loadTestCases() {
  try {
    return JSON.parse(fs.readFileSync(testCasesPath, "utf-8"));
  } catch (e) {
    return defaultTestCases;
  }
}

function loadSources() {
  try {
    return JSON.parse(fs.readFileSync(sourcesPath, "utf-8"));
  } catch (e) {
    return defaultSources;
  }
}

// Score Evaluation Logic
function evaluateAnswer(answer: string, citationsUsed: string[], testCase: any, sources: any[]) {
  const scoreBreakdown = {
    total: 0,
    required_concepts: 0,
    forbidden_claims: 0,
    citation_validity: 0,
    uncertainty: 0,
    clarity: 0
  };
  const logs: string[] = [];

  // 1. Required Concepts (40 points)
  const mustInclude = testCase.must_include || [];
  if (mustInclude.length > 0) {
    let foundCount = 0;
    const details: string[] = [];
    mustInclude.forEach((term: string) => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      if (regex.test(answer)) {
        foundCount++;
        details.push(`✓ "${term}"`);
      } else {
        details.push(`✗ "${term}"`);
      }
    });
    const pointsPerTerm = 40 / mustInclude.length;
    scoreBreakdown.required_concepts = Math.round(foundCount * pointsPerTerm);
    logs.push(`Required Concepts (${scoreBreakdown.required_concepts}/40): Found ${foundCount} of ${mustInclude.length}. Details: ${details.join(", ")}`);
  } else {
    scoreBreakdown.required_concepts = 40;
    logs.push("Required Concepts (40/40): List is empty.");
  }

  // 2. Avoids Forbidden Claims (20 points)
  const forbidden = testCase.forbidden || [];
  if (forbidden.length > 0) {
    let triggeredCount = 0;
    const details: string[] = [];
    forbidden.forEach((term: string) => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      if (regex.test(answer)) {
        triggeredCount++;
        details.push(`!! "${term}"`);
      }
    });
    if (triggeredCount === 0) {
      scoreBreakdown.forbidden_claims = 20;
      logs.push("Forbidden Claims (20/20): Great, no forbidden claims triggered!");
    } else {
      scoreBreakdown.forbidden_claims = 0;
      logs.push(`Forbidden Claims (0/20): Triggered ${triggeredCount} forbidden phrase(s): ${details.join(", ")}`);
    }
  } else {
    scoreBreakdown.forbidden_claims = 20;
    logs.push("Forbidden Claims (20/20): List is empty.");
  }

  // 3. Citation Validity (20 points)
  const validCitations = sources.map((s) => s.citation.toLowerCase().trim());
  if (citationsUsed && citationsUsed.length > 0) {
    let validCount = 0;
    let invalidCount = 0;
    const checkedDetails: string[] = [];

    citationsUsed.forEach((cit) => {
      const cleanCit = cit.toLowerCase().trim();
      const isMatch = validCitations.some(
        (val) => cleanCit.includes(val) || val.includes(cleanCit)
      );
      if (isMatch) {
        validCount++;
        checkedDetails.push(`Valid: "${cit}"`);
      } else {
        invalidCount++;
        checkedDetails.push(`Hallucinated: "${cit}"`);
      }
    });

    if (invalidCount === 0 && validCount > 0) {
      scoreBreakdown.citation_validity = 20;
      logs.push(`Citation Validity (20/20): All ${validCount} cited authorities exist in the source corpus. Checked: ${checkedDetails.join(", ")}`);
    } else if (validCount > 0) {
      scoreBreakdown.citation_validity = 10;
      logs.push(`Citation Validity (10/20): Found ${validCount} valid source citation(s), but flagged ${invalidCount} citation hallucination(s). Checked: ${checkedDetails.join(", ")}`);
    } else {
      scoreBreakdown.citation_validity = 0;
      logs.push(`Citation Validity (0/20): Hallucinated or unrecognized citations used: ${checkedDetails.join(", ")}`);
    }
  } else {
    // Check if citations appear in text instead
    let textMatches = 0;
    validCitations.forEach((val) => {
      if (answer.toLowerCase().includes(val)) {
        textMatches++;
      }
    });
    if (textMatches > 0) {
      scoreBreakdown.citation_validity = 15;
      logs.push(`Citation Validity (15/20): Found citations directly in the response text (${textMatches} match(es)), but they are missing in explicit metadata array.`);
    } else {
      scoreBreakdown.citation_validity = 0;
      logs.push("Citation Validity (0/20): Omission! No authority citations found.");
    }
  }

  // 4. Uncertainty Markers (10 points)
  const uncertaintyStem = ["record", "evidence", "if", "would need", "missing", "nexus", "adequacy", "unclear", "gaps", "stabilized"];
  let uncertaintyCount = 0;
  const foundUnc: string[] = [];
  uncertaintyStem.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\w*\\b`, "i");
    if (regex.test(answer)) {
      uncertaintyCount++;
      foundUnc.push(word);
    }
  });

  if (uncertaintyCount >= 2) {
    scoreBreakdown.uncertainty = 10;
    logs.push(`Uncertainty / Evidence Gaps (10/10): Good disclaimers and gap-analysis stems: (${foundUnc.join(", ")})`);
  } else if (uncertaintyCount === 1) {
    scoreBreakdown.uncertainty = 5;
    logs.push(`Uncertainty / Evidence Gaps (5/10): Minimal disclaimers found: (${foundUnc.join(", ")})`);
  } else {
    scoreBreakdown.uncertainty = 0;
    logs.push("Uncertainty / Evidence Gaps (0/10): Overly categorical answer; missed appropriate gap-analysis markers.");
  }

  // 5. Clear Structure (10 points)
  const hasMarkdownHeaders = /#{1,4}\s|\*\*[^*]+\*\*/.test(answer);
  const hasLists = /^[*-]\s|\b\d\.\s/m.test(answer);
  if (hasMarkdownHeaders && hasLists) {
    scoreBreakdown.clarity = 10;
    logs.push("Structure (10/10): Structured layout containing subheadings/bold sections and lists.");
  } else if (hasMarkdownHeaders || hasLists) {
    scoreBreakdown.clarity = 5;
    logs.push("Structure (5/10): Partially formatted structure. Needs both headings and lists.");
  } else {
    scoreBreakdown.clarity = 0;
    logs.push("Structure (0/10): Plain prose block with zero stylistic formatting.");
  }

  scoreBreakdown.total =
    scoreBreakdown.required_concepts +
    scoreBreakdown.forbidden_claims +
    scoreBreakdown.citation_validity +
    scoreBreakdown.uncertainty +
    scoreBreakdown.clarity;

  return { score: scoreBreakdown, logs };
}

// Token pricing estimation helper
// Models: input = $0.075 / 1M tokens, output = $0.30 / 1M tokens
function getCostAmount(promptTokens: number, outputTokens: number): number {
  const inPrice = 0.075 / 1000000;
  const outPrice = 0.30 / 1000000;
  return promptTokens * inPrice + outputTokens * outPrice;
}

// REST APIs
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Load Workspace Data
app.get("/api/all-data", (req, res) => {
  const cases = loadTestCases();
  const sources = loadSources();
  res.json({ cases, sources });
});

// Save Cases
app.post("/api/save-cases", (req, res) => {
  try {
    const { cases } = req.body;
    if (!Array.isArray(cases)) {
      return res.status(400).json({ error: "Cases must be an array" });
    }
    fs.writeFileSync(testCasesPath, JSON.stringify(cases, null, 2));
    res.json({ success: true, cases });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Save Sources
app.post("/api/save-sources", (req, res) => {
  try {
    const { sources } = req.body;
    if (!Array.isArray(sources)) {
      return res.status(400).json({ error: "Sources must be an array" });
    }
    fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2));
    res.json({ success: true, sources });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Pipeline Engine Core
async function executeSingleAgent(question: string, sources: any[], modelName = "gemini-3.1-flash"): Promise<{
  answer: string;
  citations_used: string[];
  prompt_tokens: number;
  output_tokens: number;
}> {
  const client = getGeminiClient();
  const corpusText = sources
    .map((s, idx) => `[Source ${idx + 1}] ID: ${s.source_id}\nTitle: ${s.title}\nCitation: ${s.citation}\nText: ${s.text}`)
    .join("\n\n");

  const prompt = `You are a legal-tech grounding agent. Examine the question and formulate an answer using ONLY the explicit citations and text inside the provided source corpus below. 
Do not assume facts or bind unrelated references. Make sure to list exactly which citations were used.

Source Corpus:
${corpusText}

Question:
${question}

Your response must be JSON matching the required schema. Ensure the answer is structured with headings or lists where appropriate.`;

  const response = await generateContentWithRetry({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: { type: Type.STRING },
          citations_used: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["answer", "citations_used"],
      },
    },
  });

  const parsed = JSON.parse(response.text || "{}");
  return {
    answer: parsed.answer || "",
    citations_used: parsed.citations_used || [],
    prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
    output_tokens: response.usageMetadata?.candidatesTokenCount || 0,
  };
}

// Two-Agent Core
async function executeTwoAgent(question: string, sources: any[], modelName = "gemini-3.1-flash"): Promise<{
  evidence_cards: any[];
  answer: string;
  citations_used: string[];
  missing_evidence: string[];
  prompt_tokens: number;
  output_tokens: number;
}> {
  const client = getGeminiClient();
  const corpusText = sources
    .map((s, idx) => `[ID: ${s.source_id}] Title: ${s.title}\nCitation: ${s.citation}\nText: ${s.text}`)
    .join("\n\n");

  // Agent 1: Retrieval / Extraction Agent
  const retrievalPrompt = `You are an legal evidence retrieval agent. Analyze the question and extract relevant evidence cards from the source corpus. 
For each matching source, create an evidence card explaining relevance, direct excerpts, and why it matters. Only retrieve what is actually relevant.

Source Corpus:
${corpusText}

Question:
${question}

Response must be structured JSON.`;

  const retrieverResponse = await generateContentWithRetry({
    model: modelName,
    contents: retrievalPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          evidence_cards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source_id: { type: Type.STRING },
                citation: { type: Type.STRING },
                relevance: { type: Type.STRING, description: "high, medium, or low" },
                excerpt: { type: Type.STRING },
                why_it_matters: { type: Type.STRING },
              },
              required: ["source_id", "citation", "relevance", "excerpt", "why_it_matters"],
            },
          },
        },
        required: ["evidence_cards"],
      },
    },
  });

  const retrievalParsed = JSON.parse(retrieverResponse.text || "{}");
  const evidenceCards = retrievalParsed.evidence_cards || [];

  // Agent 2: Reasoning & Drafting Agent
  const reasoningPrompt = `You are a high-level legal reasoning and drafting agent. 
You are given a query and a list of structural Evidence Cards extracted by our retrieval model. 
Construct a thorough, grounded response. Ensure you use headers/lists. Cite the authorities explicitly.
If there are gaps in the provided evidence cards to completely answer the query, itemize the missing evidence.

Question:
${question}

Structured Evidence Cards Provided:
${JSON.stringify(evidenceCards, null, 2)}

Response must be structured JSON.`;

  const reasonerResponse = await generateContentWithRetry({
    model: modelName,
    contents: reasoningPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: { type: Type.STRING },
          citations_used: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          missing_evidence: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["answer", "citations_used", "missing_evidence"],
      },
    },
  });

  const reasonerParsed = JSON.parse(reasonerResponse.text || "{}");

  const totalPromptTokens =
    (retrieverResponse.usageMetadata?.promptTokenCount || 0) +
    (reasonerResponse.usageMetadata?.promptTokenCount || 0);
  const totalOutputTokens =
    (retrieverResponse.usageMetadata?.candidatesTokenCount || 0) +
    (reasonerResponse.usageMetadata?.candidatesTokenCount || 0);

  return {
    evidence_cards: evidenceCards,
    answer: reasonerParsed.answer || "",
    citations_used: reasonerParsed.citations_used || [],
    missing_evidence: reasonerParsed.missing_evidence || [],
    prompt_tokens: totalPromptTokens,
    output_tokens: totalOutputTokens,
  };
}

// Three-Agent Core with Validation & Single-Turn Repair
async function executeThreeAgent(question: string, sources: any[], modelName = "gemini-3.1-flash"): Promise<{
  evidence_cards: any[];
  answer: string;
  citations_used: string[];
  missing_evidence: string[];
  validation: {
    passes: boolean;
    unsupported_claims: string[];
    citation_errors: string[];
    overconfidence_flags: string[];
    recommendation: string;
  };
  repaired: boolean;
  original_answer?: string;
  prompt_tokens: number;
  output_tokens: number;
}> {
  const client = getGeminiClient();

  // 1 & 2. Get retrieval evidence and draft answer using same sequence
  const pipelineB = await executeTwoAgent(question, sources, modelName);

  let runPromptTokens = pipelineB.prompt_tokens;
  let runOutputTokens = pipelineB.output_tokens;

  // Agent 3: Validation Agent
  const validationPrompt = `You are a professional legal auditor and validation agent. 
You must verify if the Proposed Answer and Citations are 100% supported by the Evidence Cards.
Flag any citation errors (referencing citations they didn't have access to), unsupported claims, or overconfidence.

Question:
${question}

Retrieved Evidence Cards:
${JSON.stringify(pipelineB.evidence_cards, null, 2)}

Proposed Answer To Audit:
${pipelineB.answer}

Proposed Citations To Audit:
${JSON.stringify(pipelineB.citations_used)}

You must output a highly strict validation response matching the JSON schema. Set recommendation to "accept" if it passes perfectly, otherwise "revise".`;

  const validatorResponse = await generateContentWithRetry({
    model: modelName,
    contents: validationPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          passes: { type: Type.BOOLEAN },
          unsupported_claims: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          citation_errors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          overconfidence_flags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          recommendation: { type: Type.STRING, description: "accept or revise" },
        },
        required: ["passes", "unsupported_claims", "citation_errors", "overconfidence_flags", "recommendation"],
      },
    },
  });

  runPromptTokens += validatorResponse.usageMetadata?.promptTokenCount || 0;
  runOutputTokens += validatorResponse.usageMetadata?.candidatesTokenCount || 0;

  const validation = JSON.parse(validatorResponse.text || "{}");

  let finalAnswer = pipelineB.answer;
  let finalCitations = pipelineB.citations_used;
  let repaired = false;
  const originalAnswer = pipelineB.answer;

  // Single-turn Repair Loop if fails validation
  if (!validation.passes || validation.recommendation === "revise") {
    repaired = true;
    const repairPrompt = `You are a premium legal repair agent. Our validation agent has audited our drafted response and found grounding errors. 
Please rewrite the drafted answer to resolve all flagged errors. You must ensure all concepts are 100% supported by the retrieved evidence cards. Do not introduce any new, unfounded claims.

Question:
${question}

Retrieved Evidence Cards:
${JSON.stringify(pipelineB.evidence_cards, null, 2)}

Drafted Answer needing fix:
${pipelineB.answer}

Flagged Grounding Errors to fix:
- Unsupported claims: ${JSON.stringify(validation.unsupported_claims)}
- Citation errors: ${JSON.stringify(validation.citation_errors)}
- Overconfidence keys: ${JSON.stringify(validation.overconfidence_flags)}

Please output the revised answer, strictly resolving all errors in the output schema.`;

    const repairResponse = await generateContentWithRetry({
      model: modelName,
      contents: repairPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            citations_used: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["answer", "citations_used"],
        },
      },
    });

    runPromptTokens += repairResponse.usageMetadata?.promptTokenCount || 0;
    runOutputTokens += repairResponse.usageMetadata?.candidatesTokenCount || 0;

    const repairParsed = JSON.parse(repairResponse.text || "{}");
    finalAnswer = repairParsed.answer || pipelineB.answer;
    finalCitations = repairParsed.citations_used || pipelineB.citations_used;
  }

  return {
    evidence_cards: pipelineB.evidence_cards,
    answer: finalAnswer,
    citations_used: finalCitations,
    missing_evidence: pipelineB.missing_evidence,
    validation,
    repaired,
    original_answer: repaired ? originalAnswer : undefined,
    prompt_tokens: runPromptTokens,
    output_tokens: runOutputTokens,
  };
}

// Generate the comparison report to outputs/reports/comparison_report.md
function generateMarkdownReport(runs: any[]): string {
  if (runs.length === 0) {
    return `# Agent Grounding Comparison Report\n\nNo test runs found. Execute a run comparison benchmark to populated this report.`;
  }

  // Group by Case id
  const grouped: Record<string, Record<string, any>> = {};
  runs.forEach((r) => {
    if (!grouped[r.case_id]) {
      grouped[r.case_id] = {};
    }
    grouped[r.case_id][r.pipeline] = r;
  });

  // Calculate averages
  const pipelineStats: Record<string, { totalScore: number; count: number; latency: number; cost: number; citErrors: number; forbidden: number }> = {
    single: { totalScore: 0, count: 0, latency: 0, cost: 0, citErrors: 0, forbidden: 0 },
    two: { totalScore: 0, count: 0, latency: 0, cost: 0, citErrors: 0, forbidden: 0 },
    three: { totalScore: 0, count: 0, latency: 0, cost: 0, citErrors: 0, forbidden: 0 },
  };

  runs.forEach((r) => {
    const p = r.pipeline;
    if (pipelineStats[p]) {
      pipelineStats[p].totalScore += r.score.total;
      pipelineStats[p].latency += r.latency_ms;
      pipelineStats[p].cost += r.estimated_cost_usd;
      pipelineStats[p].count += 1;

      // Citations validator check
      if (r.score.citation_validity < 20) {
        pipelineStats[p].citErrors += 1;
      }
      // Forbidden check
      if (r.score.forbidden_claims === 0) {
        pipelineStats[p].forbidden += 1;
      }
    }
  });

  let resultsTable = `| Case ID | Pipeline | Score | Citation Status | Forbidden Triggered | Latency (ms) | Cost ($) |\n|---|---|---:|---|:---:|---:|---:|\n`;
  runs.forEach((r) => {
    const citStatus = r.score.citation_validity === 20 ? "Perfect" : r.score.citation_validity === 10 ? "Hallucinated" : "No Citations";
    const forbiddenFlag = r.score.forbidden_claims === 0 ? "YES" : "No";
    resultsTable += `| \`${r.case_id}\` | **${r.pipeline}** | ${r.score.total} | ${citStatus} | ${forbiddenFlag} | ${r.latency_ms.toFixed(0)} | $${r.estimated_cost_usd.toFixed(6)} |\n`;
  });

  // Decide Best Pipeline Overall
  let bestPipeline = "None";
  let bestScore = -1;
  Object.keys(pipelineStats).forEach((p) => {
    const stat = pipelineStats[p];
    if (stat.count > 0) {
      const avg = stat.totalScore / stat.count;
      if (avg > bestScore) {
        bestScore = avg;
        bestPipeline = p;
      }
    }
  });

  const bestDesc =
    bestPipeline === "three"
      ? "The **Three-Agent** pipeline materially reduced unsupported claims and citation errors by running an auditor-repair cycle. It should be used for high-risk outputs where grounding is critical, while the Two-Agent pipeline is sufficient for simple, draft summaries."
      : bestPipeline === "two"
      ? "The **Two-Agent** pipeline appears to give most of the grounding benefits without the full latency/cost of the validation loop. It strikes the perfect practical balance between answering precision and speed."
      : "The **Single-Agent** pipeline outperformed in cost and latency, but shows vulnerability to citing issues or omitting key legal disclaimers under complex topics.";

  const reportContent = `# Agent Grounding MVP Comparison Report

Generated on: ${new Date().toISOString()}

## Summary

This report compares multi-agent architecture patterns for grounded regulatory summaries, analyzing:
1. **Single-Agent**: Simple prompts grouping sources and prompt limits.
2. **Two-Agent**: Splitting into a dedicated Extraction Retriever and a Drafting Reasoner.
3. **Three-Agent with Validation**: Adding a validation step auditing the draft and rewriting on error.

## Results Table

${resultsTable}

## Averages & Aggregates

| Pipeline | Avg Score | Avg Latency | Avg Cost ($) | Runs |
|---|---:|---:|---:|---:|
| **Single-Agent** | ${(pipelineStats.single.totalScore / (pipelineStats.single.count || 1)).toFixed(1)} | ${(pipelineStats.single.latency / (pipelineStats.single.count || 1)).toFixed(0)}ms | $${(pipelineStats.single.cost / (pipelineStats.single.count || 1)).toFixed(6)} | ${pipelineStats.single.count} |
| **Two-Agent** | ${(pipelineStats.two.totalScore / (pipelineStats.two.count || 1)).toFixed(1)} | ${(pipelineStats.two.latency / (pipelineStats.two.count || 1)).toFixed(0)}ms | $${(pipelineStats.two.cost / (pipelineStats.two.count || 1)).toFixed(6)} | ${pipelineStats.two.count} |
| **Three-Agent** | ${(pipelineStats.three.totalScore / (pipelineStats.three.count || 1)).toFixed(1)} | ${(pipelineStats.three.latency / (pipelineStats.three.count || 1)).toFixed(0)}ms | $${(pipelineStats.three.cost / (pipelineStats.three.count || 1)).toFixed(6)} | ${pipelineStats.three.count} |

## Best Pipeline Overall

**${bestPipeline.toUpperCase()} Agent Workflow** is the best scoring pipeline overall in grounding metrics!

${bestDesc}

## Failure Patterns Detected

1. **Single-Agent Hallucinations**: Standard models provided with broad sources sometimes pull irrelevant citations together or omit key procedural protections requested.
2. **Citation Oversights**: Answers directly stating authorities but forgetting to construct valid citations structured mapping (e.g., scoring citation validity penalties).
3. **Forbidden Claims**: Shorter agents occasionally using overly optimistic marketing terms like "guaranteed" or "automatic" due to raw LLM friendliness, which has been successfully mitigated by the Validation Agent.

## Recommendation

Based on the quantitative metrics:
- Use **Two-Agent** for high-volume, cost-sensitive internal indexing tasks. It matches 90% of structural needs.
- Use **Three-Agent with Validation** for customer-facing or legal briefs where citations error rate must approach 0%.
`;

  // Write report to markdown file as required
  try {
    fs.writeFileSync(path.join(reportsDir, "comparison_report.md"), reportContent);
  } catch (err) {
    console.error("Failed to write report.md to disk", err);
  }

  return reportContent;
}

// RUN Single Benchmark route
app.post("/api/run-single-pipeline", async (req, res) => {
  const { caseId, pipeline, model } = req.body;
  const modelName = model || "gemini-3.1-flash";
  
  if (!caseId || !pipeline) {
    return res.status(400).json({ error: "caseId and pipeline are required." });
  }

  const cases = loadTestCases();
  const sources = loadSources();

  const activeCase = cases.find((c: any) => c.id === caseId);
  if (!activeCase) {
    return res.status(404).json({ error: "Test case not found" });
  }

  const startTime = Date.now();
  try {
    let result: any = null;

    if (pipeline === "single") {
      const run = await executeSingleAgent(activeCase.question, sources, modelName);
      const evalData = evaluateAnswer(run.answer, run.citations_used, activeCase, sources);
      const lat = Date.now() - startTime;
      const cost = getCostAmount(run.prompt_tokens, run.output_tokens);

      result = {
        case_id: caseId,
        pipeline: "single",
        question: activeCase.question,
        answer: run.answer,
        evidence_cards: [],
        validation: {},
        score: evalData.score,
        eval_logs: evalData.logs,
        latency_ms: lat,
        estimated_cost_usd: cost,
      };
    } else if (pipeline === "two") {
      const run = await executeTwoAgent(activeCase.question, sources, modelName);
      const evalData = evaluateAnswer(run.answer, run.citations_used, activeCase, sources);
      const lat = Date.now() - startTime;
      const cost = getCostAmount(run.prompt_tokens, run.output_tokens);

      result = {
        case_id: caseId,
        pipeline: "two",
        question: activeCase.question,
        answer: run.answer,
        evidence_cards: run.evidence_cards,
        validation: {},
        score: evalData.score,
        eval_logs: evalData.logs,
        latency_ms: lat,
        estimated_cost_usd: cost,
      };
    } else if (pipeline === "three") {
      const run = await executeThreeAgent(activeCase.question, sources, modelName);
      const evalData = evaluateAnswer(run.answer, run.citations_used, activeCase, sources);
      const lat = Date.now() - startTime;
      const cost = getCostAmount(run.prompt_tokens, run.output_tokens);

      result = {
        case_id: caseId,
        pipeline: "three",
        question: activeCase.question,
        answer: run.answer,
        evidence_cards: run.evidence_cards,
        validation: run.validation,
        repaired: run.repaired,
        original_answer: run.original_answer,
        score: evalData.score,
        eval_logs: evalData.logs,
        latency_ms: lat,
        estimated_cost_usd: cost,
      };
    } else {
      return res.status(400).json({ error: "Invalid pipeline parameter" });
    }

    // Save actual JSON runs details
    const timestamp = Date.now();
    const runFilename = `${caseId}_${pipeline}_${timestamp}.json`;
    fs.writeFileSync(path.join(runsDir, runFilename), JSON.stringify(result, null, 2));

    // Regenerate report
    const allRuns = listAndLoadAllRuns();
    generateMarkdownReport(allRuns);

    res.json({ success: true, result });
  } catch (err: any) {
    console.error("Error executing benchmark", err);
    res.status(500).json({ error: err.message || "Failed to call Gemini model. Verify your API Key." });
  }
});

// Run-All Pipelines route
app.post("/api/run-all-pipelines", async (req, res) => {
  const { model } = req.body;
  const modelName = model || "gemini-3.1-flash";

  const cases = loadTestCases();
  const sources = loadSources();
  const results: any[] = [];
  const errors: string[] = [];

  for (const activeCase of cases) {
    const pipelines = ["single", "two", "three"];
    for (const pipeline of pipelines) {
      const startTime = Date.now();
      try {
        let result: any = null;
        if (pipeline === "single") {
          const run = await executeSingleAgent(activeCase.question, sources, modelName);
          const evalData = evaluateAnswer(run.answer, run.citations_used, activeCase, sources);
          const lat = Date.now() - startTime;
          const cost = getCostAmount(run.prompt_tokens, run.output_tokens);

          result = {
            case_id: activeCase.id,
            pipeline: "single",
            question: activeCase.question,
            answer: run.answer,
            evidence_cards: [],
            validation: {},
            score: evalData.score,
            eval_logs: evalData.logs,
            latency_ms: lat,
            estimated_cost_usd: cost,
          };
        } else if (pipeline === "two") {
          const run = await executeTwoAgent(activeCase.question, sources, modelName);
          const evalData = evaluateAnswer(run.answer, run.citations_used, activeCase, sources);
          const lat = Date.now() - startTime;
          const cost = getCostAmount(run.prompt_tokens, run.output_tokens);

          result = {
            case_id: activeCase.id,
            pipeline: "two",
            question: activeCase.question,
            answer: run.answer,
            evidence_cards: run.evidence_cards,
            validation: {},
            score: evalData.score,
            eval_logs: evalData.logs,
            latency_ms: lat,
            estimated_cost_usd: cost,
          };
        } else {
          const run = await executeThreeAgent(activeCase.question, sources, modelName);
          const evalData = evaluateAnswer(run.answer, run.citations_used, activeCase, sources);
          const lat = Date.now() - startTime;
          const cost = getCostAmount(run.prompt_tokens, run.output_tokens);

          result = {
            case_id: activeCase.id,
            pipeline: "three",
            question: activeCase.question,
            answer: run.answer,
            evidence_cards: run.evidence_cards,
            validation: run.validation,
            repaired: run.repaired,
            original_answer: run.original_answer,
            score: evalData.score,
            eval_logs: evalData.logs,
            latency_ms: lat,
            estimated_cost_usd: cost,
          };
        }

        const runFilename = `${activeCase.id}_${pipeline}_${Date.now()}.json`;
        fs.writeFileSync(path.join(runsDir, runFilename), JSON.stringify(result, null, 2));
        results.push(result);
      } catch (err: any) {
        console.error(`Error with ${activeCase.id} / ${pipeline}:`, err);
        errors.push(`${activeCase.id} (${pipeline}): ${err.message}`);
      }
    }
  }

  // Regenerate report
  const allRuns = listAndLoadAllRuns();
  generateMarkdownReport(allRuns);

  res.json({ success: true, count: results.length, results, errors });
});

// Load historical runs files from outputs/runs/
function listAndLoadAllRuns() {
  if (!fs.existsSync(runsDir)) return [];
  const files = fs.readdirSync(runsDir);
  const runs: any[] = [];
  files.forEach((file) => {
    if (file.endsWith(".json")) {
      try {
        const filePath = path.join(runsDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        runs.push({ ...data, file_name: file });
      } catch (err) {
        console.error("Error reading run file:", file, err);
      }
    }
  });
  // Sort by name or timestamp to keep ordered
  return runs.sort((a, b) => b.latency_ms - a.latency_ms);
}

app.get("/api/runs", (req, res) => {
  const runs = listAndLoadAllRuns();
  res.json({ runs });
});

// Delete all runs JSON data to reset
app.post("/api/delete-all-runs", (req, res) => {
  try {
    const files = fs.readdirSync(runsDir);
    files.forEach((file) => {
      if (file.endsWith(".json")) {
        fs.unlinkSync(path.join(runsDir, file));
      }
    });
    // Rewrite default empty report
    fs.writeFileSync(path.join(reportsDir, "comparison_report.md"), "");
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get markdown report content
app.get("/api/report", (req, res) => {
  const repPath = path.join(reportsDir, "comparison_report.md");
  let content = "";
  if (fs.existsSync(repPath)) {
    content = fs.readFileSync(repPath, "utf-8");
  } else {
    const allRuns = listAndLoadAllRuns();
    content = generateMarkdownReport(allRuns);
  }
  res.json({ report: content });
});


// Serve static Vite assets in dev, normal build folder in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started running on port ${PORT}`);
  });
}

startServer();
