// ─── Shared types, enums, and constants for Orun Advisory ────────────────────

export type Framework =
  | "EU_AI_ACT"
  | "PL_2338"
  | "LGPD"
  | "ISO_42001"
  | "NIST_AI_RMF"
  | "GDPR";

export const ALL_FRAMEWORKS: Framework[] = [
  "EU_AI_ACT", "PL_2338", "LGPD", "ISO_42001", "NIST_AI_RMF", "GDPR",
];

export type RiskTier = "minimal" | "limited" | "high" | "unacceptable";

export type OaraPillar =
  | "rights_protection"
  | "institutional_oversight"
  | "safety_risk_management"
  | "knowledge_transparency"
  | "accountability_governance";

export const OARA_PILLARS: OaraPillar[] = [
  "rights_protection",
  "institutional_oversight",
  "safety_risk_management",
  "knowledge_transparency",
  "accountability_governance",
];

export type PlanTier = "starter" | "professional" | "enterprise";

export type UserRole = "owner" | "admin" | "analyst" | "viewer";

export type ComplianceStatus =
  | "compliant"
  | "partial"
  | "non_compliant"
  | "not_assessed";

export type SeverityLevel = "critical" | "high" | "medium" | "low";

// LLM Alignment Engine
export type IssueType =
  | "gender_bias"
  | "racial_bias"
  | "cultural_bias"
  | "age_bias"
  | "policy_violation"
  | "unexplained_decision"
  | "transparency_failure"
  | "hallucination"
  | "values_misalignment";

export type SuggestionStatus =
  | "pending_review"
  | "approved"
  | "dismissed"
  | "applied";

export type LlmProvider =
  | "openai"
  | "anthropic"
  | "azure_openai"
  | "google_vertex"
  | "other";

export interface OaraScore {
  total: number; // 0-100
  pillars: Record<OaraPillar, number>;
  framework: Framework;
  assessedAt: string;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface WebhookPayload {
  integrationId: string;
  sessionId: string;
  timestamp: string;
  messages: ConversationMessage[];
  metadata?: {
    userId?: string;
    locale?: string;
    systemId?: string;
  };
}

export const REGULATORY_ARTICLES: Record<IssueType, string[]> = {
  gender_bias:           ["EU AI Act Art. 10(2)", "PL 2338 Art. 6-III", "LGPD Art. 6-IX"],
  racial_bias:           ["EU AI Act Art. 10(2)", "PL 2338 Art. 6-III", "ISO 42001 A.6.1.4"],
  cultural_bias:         ["EU AI Act Art. 10(5)", "PL 2338 Art. 6-IV", "NIST AI RMF MAP 1.5"],
  age_bias:              ["EU AI Act Art. 10(2)", "PL 2338 Art. 6-III", "GDPR Art. 22"],
  policy_violation:      ["ISO 42001 Clause 6.1", "NIST AI RMF GOVERN 1.1"],
  unexplained_decision:  ["EU AI Act Art. 13", "LGPD Art. 20", "GDPR Art. 22(3)"],
  transparency_failure:  ["EU AI Act Art. 13(1)", "PL 2338 Art. 8", "LGPD Art. 9"],
  hallucination:         ["EU AI Act Art. 9(4)", "NIST AI RMF MEASURE 2.5", "ISO 42001 A.6.2.3"],
  values_misalignment:   ["ISO 42001 Clause 4.2", "NIST AI RMF GOVERN 6.1"],
};

export const SCORE_LABELS: Record<string, string> = {
  "80-100": "Compliant — Audit Ready",
  "60-79":  "Mostly Compliant — Minor Gaps",
  "40-59":  "Significant Gaps — Action Required",
  "0-39":   "Non-Compliant — Urgent Remediation",
};
