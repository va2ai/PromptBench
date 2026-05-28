export type PipelineName = "single" | "two" | "three";
export type AgentStatus = "success" | "partial" | "failed";
export type AgentRelevance = "high" | "medium" | "low";

export interface TestCase {
  id: string;
  question: string;
  must_include: string[];
  forbidden: string[];
}

export interface SourceDocument {
  source_id: string;
  title: string;
  authority_type: string;
  citation: string;
  text: string;
}

export interface EvidenceCard {
  source_id: string;
  citation: string;
  relevance: AgentRelevance;
  excerpt: string;
  why_it_matters: string;
}

export interface ValidationDetails {
  passes?: boolean;
  unsupported_claims?: string[];
  citation_errors?: string[];
  overconfidence_flags?: string[];
  recommendation?: "accept" | "revise";
}

export interface ScoreDetails {
  total: number;
  required_concepts: number;
  forbidden_claims: number;
  citation_validity: number;
  uncertainty: number;
  clarity: number;
}

export interface AgentResult<TOutput> {
  agent_name: string;
  status: AgentStatus;
  output: TOutput;
  citations: string[];
  errors: string[];
  confidence?: number;
  prompt_tokens?: number;
  output_tokens?: number;
}

export interface WorkflowRunResult {
  case_id: string;
  pipeline: PipelineName;
  question: string;
  answer: string;
  citations_used: string[];
  evidence_cards: EvidenceCard[];
  validation: ValidationDetails;
  score: ScoreDetails;
  eval_logs: string[];
  latency_ms: number;
  estimated_cost_usd: number;
  repaired?: boolean;
  original_answer?: string;
  file_name?: string;
  provider?: string;
  model?: string;
}

export interface WorkflowTraceEvent {
  run_id: string;
  step: string;
  agent?: string;
  status: AgentStatus;
  message: string;
  timestamp: string;
}
