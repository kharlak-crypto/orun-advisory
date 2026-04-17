import {
  mysqlTable, varchar, text, int, boolean, json,
  timestamp, decimal, mysqlEnum, index, uniqueIndex, primaryKey,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────
const frameworkEnum = mysqlEnum("framework", [
  "EU_AI_ACT","PL_2338","LGPD","ISO_42001","NIST_AI_RMF","GDPR",
]);
const riskTierEnum = mysqlEnum("risk_tier", [
  "minimal","limited","high","unacceptable",
]);
const planEnum    = mysqlEnum("plan", ["starter","professional","enterprise"]);
const roleEnum    = mysqlEnum("role", ["owner","admin","analyst","viewer"]);
const severityEnum= mysqlEnum("severity", ["critical","high","medium","low"]);
const statusEnum  = mysqlEnum("status", [
  "active","inactive","archived","draft",
]);
const complianceStatusEnum = mysqlEnum("compliance_status", [
  "compliant","partial","non_compliant","not_assessed",
]);
const issueTypeEnum = mysqlEnum("issue_type", [
  "gender_bias","racial_bias","cultural_bias","age_bias",
  "policy_violation","unexplained_decision","transparency_failure",
  "hallucination","values_misalignment",
]);
const suggestionStatusEnum = mysqlEnum("suggestion_status", [
  "pending_review","approved","dismissed","applied",
]);
const providerEnum = mysqlEnum("provider", [
  "openai","anthropic","azure_openai","google_vertex","other",
]);

// ─── Organizations & Users ────────────────────────────────────────────────────
export const organizations = mysqlTable("organizations", {
  id:           varchar("id", { length: 36 }).primaryKey(),
  name:         varchar("name", { length: 255 }).notNull(),
  plan:         planEnum.notNull().default("starter"),
  billingEmail: varchar("billing_email", { length: 255 }),
  logoUrl:      varchar("logo_url", { length: 500 }),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
  updatedAt:    timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const users = mysqlTable("users", {
  id:           varchar("id", { length: 36 }).primaryKey(),
  orgId:        varchar("org_id", { length: 36 }).notNull().references(() => organizations.id),
  email:        varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name:         varchar("name", { length: 255 }).notNull(),
  role:         roleEnum.notNull().default("analyst"),
  isActive:     boolean("is_active").notNull().default(true),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});

// ─── AI Systems ───────────────────────────────────────────────────────────────
export const aiSystems = mysqlTable("ai_systems", {
  id:          varchar("id", { length: 36 }).primaryKey(),
  orgId:       varchar("org_id", { length: 36 }).notNull().references(() => organizations.id),
  name:        varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  purpose:     varchar("purpose", { length: 500 }),
  vendor:      varchar("vendor", { length: 255 }),
  version:     varchar("version", { length: 50 }),
  riskTier:    riskTierEnum.notNull().default("limited"),
  frameworks:  json("frameworks").$type<string[]>().default([]),
  status:      statusEnum.notNull().default("active"),
  deployedAt:  timestamp("deployed_at"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (t) => ({ orgIdx: index("ai_systems_org_idx").on(t.orgId) }));

// ─── Compliance Assessments (O.A.R.A™) ───────────────────────────────────────
export const complianceAssessments = mysqlTable("compliance_assessments", {
  id:           varchar("id", { length: 36 }).primaryKey(),
  systemId:     varchar("system_id", { length: 36 }).notNull().references(() => aiSystems.id),
  framework:    frameworkEnum.notNull(),
  oaraScore:    decimal("oara_score", { precision: 5, scale: 2 }),
  pillarScores: json("pillar_scores").$type<Record<string, number>>(),
  status:       complianceStatusEnum.notNull().default("not_assessed"),
  assessedBy:   varchar("assessed_by", { length: 36 }),
  assessedAt:   timestamp("assessed_at"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});

export const complianceControls = mysqlTable("compliance_controls", {
  id:          varchar("id", { length: 36 }).primaryKey(),
  framework:   frameworkEnum.notNull(),
  articleRef:  varchar("article_ref", { length: 100 }).notNull(),
  title:       varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  pillar:      varchar("pillar", { length: 100 }),
  isMandatory: boolean("is_mandatory").default(true),
});

export const controlMappings = mysqlTable("control_mappings", {
  id:           varchar("id", { length: 36 }).primaryKey(),
  assessmentId: varchar("assessment_id", { length: 36 }).notNull().references(() => complianceAssessments.id),
  controlId:    varchar("control_id", { length: 36 }).notNull().references(() => complianceControls.id),
  status:       complianceStatusEnum.notNull().default("not_assessed"),
  evidence:     text("evidence"),
  score:        decimal("score", { precision: 5, scale: 2 }),
  notes:        text("notes"),
});

// ─── M1 — Documentation Generator ────────────────────────────────────────────
export const documentationRequests = mysqlTable("documentation_requests", {
  id:          varchar("id", { length: 36 }).primaryKey(),
  systemId:    varchar("system_id", { length: 36 }).notNull().references(() => aiSystems.id),
  orgId:       varchar("org_id", { length: 36 }).notNull(),
  docType:     varchar("doc_type", { length: 100 }).notNull(),
  framework:   frameworkEnum,
  content:     text("content"),
  fileUrl:     varchar("file_url", { length: 500 }),
  status:      mysqlEnum("status", ["pending","generating","completed","failed"]).notNull().default("pending"),
  generatedBy: varchar("generated_by", { length: 36 }),
  generatedAt: timestamp("generated_at"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

// ─── M2 — Bias Auditing ───────────────────────────────────────────────────────
export const biasAuditJobs = mysqlTable("bias_audit_jobs", {
  id:             varchar("id", { length: 36 }).primaryKey(),
  systemId:       varchar("system_id", { length: 36 }).notNull().references(() => aiSystems.id),
  orgId:          varchar("org_id", { length: 36 }).notNull(),
  modelEndpoint:  varchar("model_endpoint", { length: 500 }),
  datasetRef:     varchar("dataset_ref", { length: 500 }),
  protectedAttrs: json("protected_attrs").$type<string[]>().default([]),
  status:         mysqlEnum("job_status", ["queued","running","completed","failed"]).notNull().default("queued"),
  reportUrl:      varchar("report_url", { length: 500 }),
  report:         json("report"),
  startedAt:      timestamp("started_at"),
  completedAt:    timestamp("completed_at"),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});

export const biasFindings = mysqlTable("bias_findings", {
  id:            varchar("id", { length: 36 }).primaryKey(),
  jobId:         varchar("job_id", { length: 36 }).notNull().references(() => biasAuditJobs.id),
  findingType:   varchar("finding_type", { length: 100 }).notNull(),
  severity:      severityEnum.notNull(),
  affectedGroup: varchar("affected_group", { length: 255 }),
  metric:        varchar("metric", { length: 100 }),
  value:         decimal("value", { precision: 8, scale: 4 }),
  threshold:     decimal("threshold", { precision: 8, scale: 4 }),
  description:   text("description"),
  recommendation:text("recommendation"),
});

// ─── M4 — Monitoring ─────────────────────────────────────────────────────────
export const monitoringStreams = mysqlTable("monitoring_streams", {
  id:         varchar("id", { length: 36 }).primaryKey(),
  systemId:   varchar("system_id", { length: 36 }).notNull().references(() => aiSystems.id),
  orgId:      varchar("org_id", { length: 36 }).notNull(),
  name:       varchar("name", { length: 255 }).notNull(),
  endpoint:   varchar("endpoint", { length: 500 }),
  apiKeyHash: varchar("api_key_hash", { length: 255 }),
  status:     mysqlEnum("stream_status", ["active","paused","error"]).notNull().default("active"),
  config:     json("config"),
  lastSeenAt: timestamp("last_seen_at"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

export const monitoringEvents = mysqlTable("monitoring_events", {
  id:         varchar("id", { length: 36 }).primaryKey(),
  streamId:   varchar("stream_id", { length: 36 }).notNull().references(() => monitoringStreams.id),
  eventType:  varchar("event_type", { length: 100 }).notNull(),
  severity:   severityEnum.notNull(),
  payload:    json("payload"),
  acknowledged:boolean("acknowledged").default(false),
  acknowledgedBy: varchar("acknowledged_by", { length: 36 }),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
}, (t) => ({ streamIdx: index("events_stream_idx").on(t.streamId) }));

// ─── LLM Guardrails ───────────────────────────────────────────────────────────
export const llmGuardrailRules = mysqlTable("llm_guardrail_rules", {
  id:        varchar("id", { length: 36 }).primaryKey(),
  systemId:  varchar("system_id", { length: 36 }).notNull().references(() => aiSystems.id),
  orgId:     varchar("org_id", { length: 36 }).notNull(),
  name:      varchar("name", { length: 255 }).notNull(),
  ruleType:  varchar("rule_type", { length: 100 }).notNull(),
  pattern:   text("pattern").notNull(),
  action:    mysqlEnum("rule_action", ["block","redact","flag","log"]).notNull().default("flag"),
  isActive:  boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const llmGuardrailViolations = mysqlTable("llm_guardrail_violations", {
  id:            varchar("id", { length: 36 }).primaryKey(),
  ruleId:        varchar("rule_id", { length: 36 }).notNull().references(() => llmGuardrailRules.id),
  interactionId: varchar("interaction_id", { length: 255 }),
  matchedText:   text("matched_text"),
  action:        varchar("action", { length: 50 }),
  reviewed:      boolean("reviewed").default(false),
  reviewedBy:    varchar("reviewed_by", { length: 36 }),
  timestamp:     timestamp("timestamp").defaultNow().notNull(),
});

// ─── M5 — Company Policy Engine ──────────────────────────────────────────────
export const companyPolicies = mysqlTable("company_policies", {
  id:               varchar("id", { length: 36 }).primaryKey(),
  orgId:            varchar("org_id", { length: 36 }).notNull(),
  companyName:      varchar("company_name", { length: 255 }).notNull(),
  title:            varchar("title", { length: 500 }).notNull(),
  version:          varchar("version", { length: 50 }),
  language:         varchar("language", { length: 10 }).default("en"),
  fileUrl:          varchar("file_url", { length: 500 }),
  extractionStatus: mysqlEnum("extraction_status", ["pending","extracting","completed","failed"]).default("pending"),
  requirementsCount:int("requirements_count").default(0),
  status:           statusEnum.default("active"),
  createdAt:        timestamp("created_at").defaultNow().notNull(),
});

export const companyPolicyRequirements = mysqlTable("company_policy_requirements", {
  id:              varchar("id", { length: 36 }).primaryKey(),
  policyId:        varchar("policy_id", { length: 36 }).notNull().references(() => companyPolicies.id),
  requirementCode: varchar("requirement_code", { length: 50 }).notNull(),
  title:           varchar("title", { length: 500 }).notNull(),
  description:     text("description"),
  pillar:          varchar("pillar", { length: 100 }),
  severity:        severityEnum.notNull().default("medium"),
  sourceSection:   varchar("source_section", { length: 255 }),
  extractedByLlm:  boolean("extracted_by_llm").default(true),
  crossFrameworkRefs: json("cross_framework_refs").$type<string[]>().default([]),
});

export const companyPolicyAssessments = mysqlTable("company_policy_assessments", {
  id:               varchar("id", { length: 36 }).primaryKey(),
  policyId:         varchar("policy_id", { length: 36 }).notNull().references(() => companyPolicies.id),
  requirementId:    varchar("requirement_id", { length: 36 }).notNull().references(() => companyPolicyRequirements.id),
  systemId:         varchar("system_id", { length: 36 }).notNull().references(() => aiSystems.id),
  status:           complianceStatusEnum.notNull().default("not_assessed"),
  complianceScore:  decimal("compliance_score", { precision: 5, scale: 2 }),
  notes:            text("notes"),
  assessedAt:       timestamp("assessed_at"),
});

export const policyControlMappings = mysqlTable("policy_control_mappings", {
  id:              varchar("id", { length: 36 }).primaryKey(),
  requirementId:   varchar("requirement_id", { length: 36 }).notNull().references(() => companyPolicyRequirements.id),
  framework:       frameworkEnum.notNull(),
  articleRef:      varchar("article_ref", { length: 100 }),
  equivalenceType: varchar("equivalence_type", { length: 50 }),
  equivalenceScore:decimal("equivalence_score", { precision: 5, scale: 2 }),
});

// ─── LLM Remediation Engine ───────────────────────────────────────────────────
export const complianceRemediations = mysqlTable("compliance_remediations", {
  id:                 varchar("id", { length: 36 }).primaryKey(),
  orgId:              varchar("org_id", { length: 36 }).notNull(),
  interactionId:      varchar("interaction_id", { length: 255 }),
  issueType:          issueTypeEnum.notNull(),
  severity:           severityEnum.notNull().default("medium"),
  regulatoryBreaches: json("regulatory_breaches").$type<string[]>().default([]),
  remediationTitle:   varchar("remediation_title", { length: 500 }),
  suggestedPrompt:    text("suggested_prompt"),
  promptPlacement:    varchar("prompt_placement", { length: 50 }).default("append"),
  status:             mysqlEnum("remediation_status", [
    "pending_review","approved","applied","dismissed","superseded",
  ]).notNull().default("pending_review"),
  reviewedBy:         varchar("reviewed_by", { length: 36 }),
  reviewedAt:         timestamp("reviewed_at"),
  createdAt:          timestamp("created_at").defaultNow().notNull(),
});

// ─── ★ Continuous LLM Alignment Engine ───────────────────────────────────────
export const llmIntegrations = mysqlTable("llm_integrations", {
  id:            varchar("id", { length: 36 }).primaryKey(),
  orgId:         varchar("org_id", { length: 36 }).notNull(),
  systemId:      varchar("system_id", { length: 36 }).references(() => aiSystems.id),
  name:          varchar("name", { length: 255 }).notNull(),
  provider:      providerEnum.notNull().default("openai"),
  webhookSecret: varchar("webhook_secret", { length: 255 }).notNull(),
  status:        mysqlEnum("integration_status", ["active","paused","error"]).notNull().default("active"),
  config:        json("config"),
  totalConversations: int("total_conversations").default(0),
  lastConversationAt: timestamp("last_conversation_at"),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
}, (t) => ({ orgIdx: index("integrations_org_idx").on(t.orgId) }));

export const conversationLogs = mysqlTable("conversation_logs", {
  id:             varchar("id", { length: 36 }).primaryKey(),
  integrationId:  varchar("integration_id", { length: 36 }).notNull().references(() => llmIntegrations.id),
  sessionId:      varchar("session_id", { length: 255 }).notNull(),
  messages:       json("messages").notNull(),
  userLocale:     varchar("user_locale", { length: 20 }),
  analyzedAt:     timestamp("analyzed_at"),
  issueCount:     int("issue_count").default(0),
  complianceScore:decimal("compliance_score", { precision: 5, scale: 2 }),
  purgedAt:       timestamp("purged_at"),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
}, (t) => ({ intIdx: index("conv_integration_idx").on(t.integrationId) }));

export const alignmentSuggestions = mysqlTable("alignment_suggestions", {
  id:                      varchar("id", { length: 36 }).primaryKey(),
  integrationId:           varchar("integration_id", { length: 36 }).notNull().references(() => llmIntegrations.id),
  conversationId:          varchar("conversation_id", { length: 36 }).references(() => conversationLogs.id),
  issueType:               issueTypeEnum.notNull(),
  severity:                severityEnum.notNull(),
  problematicExcerpt:      text("problematic_excerpt"),
  explanation:             text("explanation"),
  suggestedPromptAddition: text("suggested_prompt_addition").notNull(),
  regulatoryArticles:      json("regulatory_articles").$type<string[]>().default([]),
  confidenceScore:         decimal("confidence_score", { precision: 5, scale: 2 }),
  status:                  suggestionStatusEnum.notNull().default("pending_review"),
  adminNotes:              text("admin_notes"),
  reviewedBy:              varchar("reviewed_by", { length: 36 }),
  reviewedAt:              timestamp("reviewed_at"),
  appliedAt:               timestamp("applied_at"),
  createdAt:               timestamp("created_at").defaultNow().notNull(),
}, (t) => ({ intIdx: index("suggestions_int_idx").on(t.integrationId) }));

export const systemPromptVersions = mysqlTable("system_prompt_versions", {
  id:            varchar("id", { length: 36 }).primaryKey(),
  integrationId: varchar("integration_id", { length: 36 }).notNull().references(() => llmIntegrations.id),
  version:       int("version").notNull(),
  promptContent: text("prompt_content").notNull(),
  changeReason:  text("change_reason"),
  appliedBy:     varchar("applied_by", { length: 36 }),
  appliedAt:     timestamp("applied_at").defaultNow().notNull(),
  isActive:      boolean("is_active").notNull().default(false),
  suggestionId:  varchar("suggestion_id", { length: 36 }),
}, (t) => ({ intIdx: index("prompt_versions_int_idx").on(t.integrationId) }));

export const alignmentMetrics = mysqlTable("alignment_metrics", {
  id:                   varchar("id", { length: 36 }).primaryKey(),
  integrationId:        varchar("integration_id", { length: 36 }).notNull().references(() => llmIntegrations.id),
  date:                 varchar("date", { length: 10 }).notNull(),
  avgBiasScore:         decimal("avg_bias_score", { precision: 5, scale: 2 }),
  avgComplianceScore:   decimal("avg_compliance_score", { precision: 5, scale: 2 }),
  conversationsAnalyzed:int("conversations_analyzed").default(0),
  suggestionsGenerated: int("suggestions_generated").default(0),
  suggestionsApplied:   int("suggestions_applied").default(0),
  issueTypeBreakdown:   json("issue_type_breakdown"),
}, (t) => ({ uniq: uniqueIndex("metrics_int_date").on(t.integrationId, t.date) }));

// ─── Admin / Compliance Calendar ─────────────────────────────────────────────
export const complianceDeadlines = mysqlTable("compliance_deadlines", {
  id:          varchar("id", { length: 36 }).primaryKey(),
  framework:   frameworkEnum.notNull(),
  region:      mysqlEnum("region", ["EU","BR","US","UK","CN","GLOBAL"]).notNull(),
  deadlineType:varchar("deadline_type", { length: 100 }).notNull(),
  date:        varchar("date", { length: 10 }).notNull(),
  description: text("description"),
  penaltyInfo: text("penalty_info"),
  articleRef:  varchar("article_ref", { length: 100 }),
});

export const raciAssignments = mysqlTable("raci_assignments", {
  id:                varchar("id", { length: 36 }).primaryKey(),
  systemId:          varchar("system_id", { length: 36 }).notNull().references(() => aiSystems.id),
  role:              varchar("role", { length: 100 }).notNull(),
  responsibleUserId: varchar("responsible_user_id", { length: 36 }),
  raciType:          mysqlEnum("raci_type", ["responsible","accountable","consulted","informed"]).notNull(),
  notes:             text("notes"),
});

export const auditLogs = mysqlTable("audit_logs", {
  id:           varchar("id", { length: 36 }).primaryKey(),
  orgId:        varchar("org_id", { length: 36 }).notNull(),
  userId:       varchar("user_id", { length: 36 }),
  action:       varchar("action", { length: 255 }).notNull(),
  resourceType: varchar("resource_type", { length: 100 }),
  resourceId:   varchar("resource_id", { length: 36 }),
  details:      json("details"),
  ipAddress:    varchar("ip_address", { length: 45 }),
  timestamp:    timestamp("timestamp").defaultNow().notNull(),
}, (t) => ({ orgIdx: index("audit_org_idx").on(t.orgId) }));

// ─── Type exports ─────────────────────────────────────────────────────────────
export type Organization = typeof organizations.$inferSelect;
export type User = typeof users.$inferSelect;
export type AiSystem = typeof aiSystems.$inferSelect;
export type ComplianceAssessment = typeof complianceAssessments.$inferSelect;
export type BiasAuditJob = typeof biasAuditJobs.$inferSelect;
export type LlmIntegration = typeof llmIntegrations.$inferSelect;
export type AlignmentSuggestion = typeof alignmentSuggestions.$inferSelect;
export type SystemPromptVersion = typeof systemPromptVersions.$inferSelect;
export type AlignmentMetric = typeof alignmentMetrics.$inferSelect;
