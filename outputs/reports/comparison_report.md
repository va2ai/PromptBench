# Agent Grounding MVP Comparison Report

Generated on: 2026-05-29T22:12:37.250Z
Runs analyzed: 10 (Single-Agent: 8, Two-Agent: 2)

## Summary

This report compares multi-agent architecture patterns for grounded regulatory summaries:
1. **Single-Agent**: One prompt over the full source corpus.
2. **Two-Agent**: A dedicated extraction retriever feeding a drafting reasoner.
3. **Three-Agent with Validation**: Adds an auditor that flags unsupported claims and triggers a repair rewrite.

All figures below are computed from the runs on disk. Sections are omitted of comparative claims when the data does not support them.

## Results Table

| Case ID | Pipeline | Score | Concepts /40 | Forbidden /20 | Citation /20 | Gaps /10 | Structure /10 | Latency | Cost |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `sleep_apnea_secondary_ptsd` | **single** | 82 | 32 | 20 | 20 | 10 | 0 | 125723ms | $0.001930 |
| `sleep_apnea_secondary_ptsd` | **single** | 92 | 32 | 20 | 20 | 10 | 10 | 123516ms | $0.001007 |
| `sleep_apnea_secondary_ptsd` | **single** | 79 | 24 | 20 | 20 | 10 | 5 | 106911ms | $0.001510 |
| `sleep_apnea_secondary_ptsd` | **single** | 87 | 32 | 20 | 20 | 10 | 5 | 102995ms | $0.001419 |
| `sleep_apnea_secondary_ptsd` | **single** | 100 | 40 | 20 | 20 | 10 | 10 | 102371ms | $0.000620 |
| `sleep_apnea_secondary_ptsd` | **single** | 74 | 24 | 20 | 20 | 10 | 0 | 92132ms | $0.001254 |
| `sleep_apnea_secondary_ptsd` | **single** | 72 | 32 | 20 | 0 | 10 | 10 | 80814ms | $0.000354 |
| `sleep_apnea_secondary_ptsd` | **single** | 61 | 16 | 20 | 20 | 0 | 5 | 79322ms | $0.000703 |
| `tdiu_part_time_work` | **two** | 76 | 16 | 20 | 20 | 10 | 10 | 77074ms | $0.001100 |
| `sleep_apnea_secondary_ptsd` | **two** | 64 | 24 | 20 | 10 | 0 | 10 | 69755ms | $0.001725 |


## Averages & Aggregates

| Pipeline | Avg Score | Avg Latency | Avg Cost ($) | Runs |
|---|---:|---:|---:|---:|
| **Single-Agent** | 80.9 | 101723ms | $0.001100 | 8 |
| **Two-Agent** | 70.0 | 73415ms | $0.001413 | 2 |
| **Three-Agent** | — | — | — | not run |


## Best Pipeline Overall

**Single-Agent** leads with an average of 80.9/100, 10.9 points ahead of Two-Agent, across 2 pipelines and 10 total run(s).

## Failure Patterns Detected

- **Single-Agent**: 1/8 had no valid citation; 1/8 were categorical (no evidence-gap language).
- **Two-Agent**: 1/2 had a citation issue (hallucinated or metadata-only); 1/2 were categorical (no evidence-gap language).

## Evidence Gaps & Auditor Findings

**`tdiu_part_time_work` — two**
- Missing evidence: CAVC case law operationalizing the marginal employment standard under § 4.16 (e.g., Faust v. West, Moore v. Derwinski)
- Missing evidence: Current and adjudication-year federal poverty threshold figures used to evaluate marginal employment
- Missing evidence: 38 CFR § 4.16(a) vs. § 4.16(b) distinction — schedular vs. extra-schedular TDIU pathways
- Missing evidence: 38 CFR § 3.340 and § 3.341 — total disability standard and employability determination framework
- Missing evidence: 38 CFR § 3.159 — VA duty to assist, including failure to obtain vocational assessment or independent medical opinion on employability
- Missing evidence: Factual record: nature, frequency, hours, and income of the veteran's part-time work as reflected in the rating decision and Board transcript
**`sleep_apnea_secondary_ptsd` — two**
- Missing evidence: Medical nexus opinion from sleep specialist on PTSD-sleep apnea causal relationship
- Missing evidence: Veteran's lay statement describing temporal onset of sleep disturbances relative to PTSD diagnosis
- Missing evidence: VA clinical documentation of sleep complaints, nightmares, or hyperarousal in PTSD treatment records
- Missing evidence: Sleep apnea diagnostic data including sleep study results and AHI severity metrics
- Missing evidence: Details of initial denying decision's rationale (nexus rejection, lack of expert opinion, etc.)
- Missing evidence: Prior BVA or VA decisions clarifying whether this is an initial or appellate denial
- Missing evidence: Peer-reviewed medical literature on epidemiology and mechanisms linking PTSD to sleep-disordered breathing
- Missing evidence: Evidence of pre-PTSD sleep status if pursuing aggravation theory
