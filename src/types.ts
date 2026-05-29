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

export interface ScoreDetails {
  total: number;
  required_concepts: number;
  forbidden_claims: number;
  citation_validity: number;
  uncertainty: number;
  clarity: number;
}

export interface EvidenceCard {
  source_id: string;
  citation: string;
  relevance: 'high' | 'medium' | 'low';
  excerpt: string;
  why_it_matters: string;
}

export interface ValidationDetails {
  passes?: boolean;
  unsupported_claims?: string[];
  citation_errors?: string[];
  overconfidence_flags?: string[];
  recommendation?: 'accept' | 'revise';
}

export interface RunRecord {
  case_id: string;
  pipeline: 'single' | 'two' | 'three';
  question?: string;
  answer: string;
  citations_used: string[];
  evidence_cards: EvidenceCard[];
  missing_evidence?: string[];
  validation: ValidationDetails;
  score: ScoreDetails;
  eval_logs?: string[];
  latency_ms: number;
  estimated_cost_usd: number;
  file_name?: string;
  repaired?: boolean;
  original_answer?: string;
}
