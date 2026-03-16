# ZenThera IO

## AI Ethics & Governance Platform

ZenThera IO is an enterprise-grade AI Ethics & Governance platform designed to ensure that artificial intelligence systems operate safely, transparently, and in full compliance with emerging global regulations such as the EU AI Act, US NIST AI RMF, and ISO/IEC 42001.

---

## Documentation

### Feature Specifications

| Document | Description |
|----------|-------------|
| [Feature 1: LLM Observability Engine](docs/features/ZenThera_Feature1_Complete_Documentation.md) | Detects hallucinations, contradictions, ambiguity, and performance anomalies in LLM outputs |
| [Feature 2: User Behavior & Friction Analysis](docs/features/ZenThera_Feature2_Complete_Documentation.md) | Detects user frustration, reprompt loops, session abandonment, and provides real-time failure alerting |
| [Feature 3: AI Ethics & Risk Monitoring](docs/features/ZenThera_Feature3_Complete_Documentation.md) | Multi-layer ethics detection with POLARIS-X algorithm, EU AI Act, NIST RMF, and ISO 42001 compliance |

### Stakeholder Overview

| Document | Description |
|----------|-------------|
| [Executive Stakeholder Overview](docs/stakeholder/ZenThera_Stakeholder_Overview.md) | Business-focused overview of the solution for executives, investors, and non-technical stakeholders |

### Project Plan

| Document | Description |
|----------|-------------|
| [Project Structure & TODO List](docs/project-plan/ZenThera_Project_Structure_TODO.md) | Complete frontend and backend architecture, technology stack, and development roadmap |

---

## Core Features

**Feature 1: LLM Observability Engine** -- Monitors every interaction between users and LLMs to detect hallucinations, contradictions, ambiguity, and performance issues using advanced NLI-based algorithms and statistical anomaly detection.

**Feature 2: User Behavior & Friction Analysis** -- Analyzes user interaction patterns to identify friction points such as reprompt loops and session abandonment. Includes an integrated Failure Detection & Alert System with real-time notifications via Slack, PagerDuty, and email.

**Feature 3: AI Ethics & Risk Monitoring** -- Powered by the proprietary POLARIS-X algorithm, this module automates compliance checking against the EU AI Act, US NIST AI RMF, and ISO/IEC 42001. Includes toxicity detection, bias analysis, and immutable audit trails.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Next.js, Tailwind CSS, Shadcn UI, Recharts |
| Backend | Python 3.11, FastAPI, SQLAlchemy, Alembic |
| Database | PostgreSQL, TimescaleDB |
| Queue/Cache | Redis, Celery |
| Infrastructure | Docker, Kubernetes |

---

## Product Status

This is a **final product** specification (not an MVP), designed for enterprise-scale deployment.
