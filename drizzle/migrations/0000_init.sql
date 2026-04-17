-- Orun Advisory — Initial Schema Migration
-- Run: pnpm db:migrate

CREATE TABLE IF NOT EXISTS `organizations` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `plan` enum('starter','professional','enterprise') NOT NULL DEFAULT 'starter',
  `billing_email` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT NOW(),
  `updated_at` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL,
  `org_id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('owner','admin','analyst','viewer') NOT NULL DEFAULT 'analyst',
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`)
);

CREATE TABLE IF NOT EXISTS `ai_systems` (
  `id` varchar(36) NOT NULL,
  `org_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `purpose` varchar(500),
  `vendor` varchar(255),
  `version` varchar(50),
  `risk_tier` enum('minimal','limited','high','unacceptable') NOT NULL DEFAULT 'limited',
  `frameworks` json DEFAULT '[]',
  `status` enum('active','inactive','archived','draft') NOT NULL DEFAULT 'active',
  `deployed_at` timestamp NULL,
  `created_at` timestamp NOT NULL DEFAULT NOW(),
  `updated_at` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (`id`),
  KEY `ai_systems_org_idx` (`org_id`)
);

-- LLM Alignment Engine tables (migration 0006)
CREATE TABLE IF NOT EXISTS `llm_integrations` (
  `id` varchar(36) NOT NULL,
  `org_id` varchar(36) NOT NULL,
  `system_id` varchar(36),
  `name` varchar(255) NOT NULL,
  `provider` enum('openai','anthropic','azure_openai','google_vertex','other') NOT NULL DEFAULT 'openai',
  `webhook_secret` varchar(255) NOT NULL,
  `status` enum('active','paused','error') NOT NULL DEFAULT 'active',
  `config` json,
  `total_conversations` int DEFAULT 0,
  `last_conversation_at` timestamp NULL,
  `created_at` timestamp NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`),
  KEY `integrations_org_idx` (`org_id`)
);

CREATE TABLE IF NOT EXISTS `conversation_logs` (
  `id` varchar(36) NOT NULL,
  `integration_id` varchar(36) NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `messages` json NOT NULL,
  `user_locale` varchar(20),
  `analyzed_at` timestamp NULL,
  `issue_count` int DEFAULT 0,
  `compliance_score` decimal(5,2),
  `purged_at` timestamp NULL,
  `created_at` timestamp NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`),
  KEY `conv_integration_idx` (`integration_id`),
  FOREIGN KEY (`integration_id`) REFERENCES `llm_integrations`(`id`)
);

CREATE TABLE IF NOT EXISTS `alignment_suggestions` (
  `id` varchar(36) NOT NULL,
  `integration_id` varchar(36) NOT NULL,
  `conversation_id` varchar(36),
  `issue_type` enum('gender_bias','racial_bias','cultural_bias','age_bias','policy_violation','unexplained_decision','transparency_failure','hallucination','values_misalignment') NOT NULL,
  `severity` enum('critical','high','medium','low') NOT NULL,
  `problematic_excerpt` text,
  `explanation` text,
  `suggested_prompt_addition` text NOT NULL,
  `regulatory_articles` json DEFAULT '[]',
  `confidence_score` decimal(5,2),
  `status` enum('pending_review','approved','dismissed','applied') NOT NULL DEFAULT 'pending_review',
  `admin_notes` text,
  `reviewed_by` varchar(36),
  `reviewed_at` timestamp NULL,
  `applied_at` timestamp NULL,
  `created_at` timestamp NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`),
  KEY `suggestions_int_idx` (`integration_id`)
);

CREATE TABLE IF NOT EXISTS `system_prompt_versions` (
  `id` varchar(36) NOT NULL,
  `integration_id` varchar(36) NOT NULL,
  `version` int NOT NULL,
  `prompt_content` text NOT NULL,
  `change_reason` text,
  `applied_by` varchar(36),
  `applied_at` timestamp NOT NULL DEFAULT NOW(),
  `is_active` boolean NOT NULL DEFAULT false,
  `suggestion_id` varchar(36),
  PRIMARY KEY (`id`),
  KEY `prompt_versions_int_idx` (`integration_id`)
);

CREATE TABLE IF NOT EXISTS `alignment_metrics` (
  `id` varchar(36) NOT NULL,
  `integration_id` varchar(36) NOT NULL,
  `date` varchar(10) NOT NULL,
  `avg_bias_score` decimal(5,2),
  `avg_compliance_score` decimal(5,2),
  `conversations_analyzed` int DEFAULT 0,
  `suggestions_generated` int DEFAULT 0,
  `suggestions_applied` int DEFAULT 0,
  `issue_type_breakdown` json,
  PRIMARY KEY (`id`),
  UNIQUE KEY `metrics_int_date` (`integration_id`, `date`)
);
