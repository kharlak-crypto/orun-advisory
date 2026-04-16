# Orun Advisory — O.A.R.A™ Platform

## AI Governance & Compliance SaaS

**O.A.R.A™** (Organisation AI Responsibility Assessment) is a production-grade, multi-regulation AI governance and compliance platform built for the era of regulated artificial intelligence. It delivers simultaneous compliance assessment across six major regulatory frameworks from a single unified workflow.

> Version 2.0 · April 2026 · Prepared by Orun Advisory · carla.caldeira@gmail.com

---

## Regulatory Frameworks Covered

| Framework | Region | Key Penalty |
|-----------|--------|-------------|
| EU AI Act | Europe | €35M or 7% global revenue |
| Brazil PL 2338/2023 | Brazil | R$50M per violation |
| LGPD | Brazil | Up to R$50M |
| ISO 42001 | Global | Certification requirement |
| NIST AI RMF | USA/Global | Federal compliance |
| GDPR | Europe | €20M or 4% global revenue |

---

## Platform Modules

The platform is structured around six core modules:

- **M1 — Auto Documentation**: Automatically generates AI system documentation required by all six frameworks
- **M2 — Bias Auditing**: Detects and quantifies algorithmic bias across protected attributes
- **M3 — Compliance Mapper (O.A.R.A™)**: Proprietary algorithm producing a 0–100 accountability score across five pillars
- **M4 — Real-Time Monitoring**: Continuous compliance monitoring with alerting and incident response
- **M5 — Company Policy Engine**: Generates and manages internal AI governance policies
- **M6 — Continuous LLM Alignment Engine**: Analyzes every LLM conversation for bias, policy violations, and regulatory non-compliance; generates targeted system-prompt improvements

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + Vite + TypeScript | 19 / 7 / 5 |
| Styling | Tailwind CSS + Radix UI + shadcn | 4 / latest |
| Backend | Node.js + tRPC | 22 / 11 |
| Database | MySQL + Drizzle ORM | 8 / 0.30 |
| AI Engine | Anthropic Claude API | claude-3-5-sonnet |
| Package Manager | pnpm workspaces | 9 |
| Containerization | Docker Compose | 3.8 |

---

## Project Structure

```
orun-advisory/
├── client/                  # React 19 frontend
│   ├── src/
│   │   ├── pages/           # Feature pages (Dashboard, BiasAuditing, etc.)
│   │   │   └── compliance/  # Per-regulation detail pages
│   │   └── components/      # Shared UI components
│   └── vite.config.ts
├── server/                  # Node.js + tRPC backend
│   └── src/
│       ├── routers/         # API route handlers per module
│       ├── auth.ts          # Authentication logic
│       ├── db.ts            # Database connection
│       └── llm.ts           # Claude AI integration
├── drizzle/                 # Database schema & migrations
│   ├── schema.ts
│   └── migrations/
├── shared/                  # Shared TypeScript types
├── docker-compose.yml       # Container orchestration
└── package.json             # Monorepo root
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+
- MySQL 8+
- Anthropic API key

### Installation

```bash
# Clone the repository
git clone https://github.com/kharlak-crypto/tax-reform.git
cd tax-reform

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys

# Push database schema
pnpm db:push

# Start development servers
pnpm dev
```

### Environment Variables

See `.env.example` for the full list of required environment variables including:
- `DATABASE_URL` — MySQL connection string
- `ANTHROPIC_API_KEY` — Claude API key
- `JWT_SECRET` — Authentication secret
- `SESSION_SECRET` — Session management secret

---

## O.A.R.A™ Algorithm — Five-Pillar Assessment

The proprietary algorithm assesses AI systems across five pillars simultaneously against all six regulatory frameworks:

| Pillar | Description | Key Regulations |
|--------|-------------|-----------------|
| Rights Protection | Individual rights, explainability, contestation | EU AI Act Arts. 6–11, PL 2338 Arts. 6–11 |
| Institutional Oversight | Governance structures, RACI, board accountability | ISO 42001, NIST, PL 2338 Arts. 45–54 |
| Safety & Risk Management | Risk classification, testing, incident response | EU AI Act Annex III, PL 2338 Art. 12–15 |
| Knowledge Transparency | Technical docs, model cards, audit logs | EU AI Act Art. 11, ISO 42001 Clause 7 |
| Accountability Governance | Bias auditing, fairness metrics, KPIs | EU AI Act Art. 10, LGPD Art. 20, NIST |

---

## Market Context

The global AI governance market is expanding at **36% CAGR**, driven by converging regulatory pressure across jurisdictions. With the EU AI Act's high-risk system deadline on **2 August 2026** and Brazil's PL 2338/2023 nearing final enactment, Orun Advisory is positioned at the optimal market entry point.

| Metric | 2025 Baseline | 2030 Target |
|--------|--------------|-------------|
| Global AI Governance TAM | $308M | $3.6B |
| EU AI Act Compliance Market | €492M | €17B |
| Brazil AI Governance Market | $30M | $2.2B |
| Orun Advisory ARR | Pre-revenue | R$52M+ |

---

## License

Proprietary — All rights reserved. © 2026 Orun Advisory.

For licensing inquiries: carla.caldeira@gmail.com · orunadvisory.com
