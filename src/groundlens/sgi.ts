// ---------------------------------------------------------------------------
// Groundlens SGI — deterministic geometric grounding scorer.
//
// No LLM-as-judge. Given an answer and the evidence chunks that were retrieved
// for its question, the Source Grounding Index (SGI) measures how much of the
// answer's informative content is actually supported by that evidence, using
// IDF-weighted token coverage aggregated with a GEOMETRIC mean (so a single
// fabricated claim drags the whole score down — the intended risk behavior).
//
// Everything here is pure, deterministic, and sub-second: same inputs always
// produce the same SGI. server.ts owns the LLM calls; this module owns the math.
// ---------------------------------------------------------------------------

// Verdict thresholds on the SGI scale (1.0 = grounding baseline).
export const SGI_BASELINE = 1.0;
export const TRUST_THRESHOLD = 1.0; // >= 1.0 -> trusted
export const REVIEW_THRESHOLD = 0.85; // [0.85, 1.0) -> review, < 0.85 -> flagged

// TAU is the target grounding fraction that defines SGI = 1.0. An answer whose
// IDF-weighted token coverage (geometric mean over sentences) equals TAU scores
// exactly 1.0; better-grounded answers exceed it (up to ~1/TAU), worse-grounded
// ones fall below. Calibrated against faithful extractive answers landing >1.0.
export const TAU = 0.62;

export const DEFAULT_TOP_K = 3;

export type Verdict = "trusted" | "review" | "flagged";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "if", "then", "else", "of", "to", "in", "on", "at",
  "for", "with", "by", "from", "as", "is", "are", "was", "were", "be", "been", "being", "it",
  "its", "this", "that", "these", "those", "which", "who", "whom", "whose", "what", "when",
  "where", "why", "how", "not", "no", "do", "does", "did", "has", "have", "had", "can", "could",
  "will", "would", "should", "shall", "may", "might", "must", "about", "into", "over", "under",
  "than", "so", "such", "there", "here", "their", "them", "they", "we", "you", "i", "he", "she",
  "his", "her", "our", "your", "also", "any", "all", "some", "more", "most", "other", "only",
  "own", "same", "each", "both", "between", "during", "while", "because",
]);

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(
    (t) => t.length >= 2 && !STOPWORDS.has(t),
  );
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?;:])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function splitChunks(document: string): string[] {
  // Paragraph-level chunks; merge stray very-short fragments into the previous one.
  const raw = document
    .split(/\n\s*\n/)
    .map((c) => c.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const chunks: string[] = [];
  for (const c of raw) {
    if (chunks.length > 0 && c.length < 40) {
      chunks[chunks.length - 1] += " " + c;
    } else {
      chunks.push(c);
    }
  }
  return chunks.length > 0 ? chunks : [document.replace(/\s+/g, " ").trim()];
}

// IDF over a corpus of chunks. Unknown tokens (e.g. fabricated terms not in the
// document) are treated as maximally rare, which is what penalizes invented
// specifics: they carry high weight and can never be found in evidence.
export type IdfModel = { idf: Map<string, number>; maxIdf: number };

export function buildIdf(chunks: string[]): IdfModel {
  const n = chunks.length;
  const df = new Map<string, number>();
  for (const chunk of chunks) {
    const seen = new Set(tokenize(chunk));
    for (const t of seen) df.set(t, (df.get(t) || 0) + 1);
  }
  const idf = new Map<string, number>();
  for (const [t, d] of df) idf.set(t, Math.log((n + 1) / (d + 1)) + 1);
  const maxIdf = Math.log((n + 1) / 1) + 1; // df = 0 -> rarest possible
  return { idf, maxIdf };
}

function idfOf(model: IdfModel, token: string): number {
  return model.idf.get(token) ?? model.maxIdf;
}

function tfidfVector(tokens: string[], model: IdfModel): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  const vec = new Map<string, number>();
  for (const [t, f] of tf) vec.set(t, f * idfOf(model, t));
  return vec;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const [, v] of a) na += v * v;
  for (const [, v] of b) nb += v * v;
  if (na === 0 || nb === 0) return 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const [t, v] of small) {
    const w = large.get(t);
    if (w) dot += v * w;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export type RetrievedChunk = { index: number; text: string; score: number };

// TF-IDF top-K retrieval of document chunks for a query.
export function retrieve(
  query: string,
  chunks: string[],
  model: IdfModel,
  topK = DEFAULT_TOP_K,
): RetrievedChunk[] {
  const qVec = tfidfVector(tokenize(query), model);
  return chunks
    .map((text, index) => ({ index, text, score: cosine(qVec, tfidfVector(tokenize(text), model)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export type SentenceSupport = { sentence: string; support: number };

export type SgiResult = {
  sgi: number;
  verdict: Verdict;
  grounding: number; // geometric-mean coverage in [0,1], before TAU normalization
  sentenceSupport: SentenceSupport[];
};

export function verdictFor(sgi: number): Verdict {
  if (sgi >= TRUST_THRESHOLD) return "trusted";
  if (sgi >= REVIEW_THRESHOLD) return "review";
  return "flagged";
}

// Core SGI: IDF-weighted token coverage per sentence, combined with a geometric
// mean, then expressed as a multiple of the TAU grounding baseline.
export function scoreSgi(answer: string, evidenceChunks: string[], model: IdfModel): SgiResult {
  const evidenceTokens = new Set<string>();
  for (const chunk of evidenceChunks) for (const t of tokenize(chunk)) evidenceTokens.add(t);

  const sentences = splitSentences(answer);
  const sentenceSupport: SentenceSupport[] = [];

  for (const sentence of sentences) {
    const toks = tokenize(sentence);
    if (toks.length === 0) continue;
    let supported = 0;
    let total = 0;
    for (const t of toks) {
      const w = idfOf(model, t);
      total += w;
      if (evidenceTokens.has(t)) supported += w;
    }
    if (total === 0) continue;
    sentenceSupport.push({ sentence, support: supported / total });
  }

  if (sentenceSupport.length === 0) {
    // Empty / contentless answer: no grounding to credit.
    return { sgi: 0, verdict: "flagged", grounding: 0, sentenceSupport: [] };
  }

  // Geometric mean of per-sentence support. EPS keeps log() finite and means a
  // single fully-unsupported sentence floors rather than zeroes the score.
  const EPS = 0.05;
  const logSum = sentenceSupport.reduce((acc, s) => acc + Math.log(s.support + EPS), 0);
  const grounding = Math.exp(logSum / sentenceSupport.length) - EPS;
  const clamped = Math.max(0, grounding);
  const sgi = clamped / TAU;

  return { sgi, verdict: verdictFor(sgi), grounding: clamped, sentenceSupport };
}
