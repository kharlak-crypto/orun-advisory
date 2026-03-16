# ZenThera IO: Project Structure & Development TODO List

## 1. Project Architecture Overview

ZenThera IO will be built as a modern, scalable enterprise SaaS application. The architecture is separated into a frontend Single Page Application (SPA) and a backend microservices-oriented API.

### Technology Stack
- **Frontend**: React 18, TypeScript, Next.js (App Router), Tailwind CSS, Shadcn UI, Recharts (for data visualization)
- **Backend**: Python 3.11, FastAPI, PostgreSQL (relational data), TimescaleDB (time-series logs), Redis (caching/queues)
- **Infrastructure**: Docker, Kubernetes, AWS/GCP

---

## 2. Frontend Project Structure

```text
zenthera-frontend/
├── public/                 # Static assets (images, icons, fonts)
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (auth)/         # Authentication routes (login, register)
│   │   ├── (dashboard)/    # Main application layout
│   │   │   ├── page.tsx    # Main Dashboard (Credo.ai style)
│   │   │   ├── observability/ # Feature 1: LLM Observability
│   │   │   ├── behavior/   # Feature 2: User Behavior & Friction
│   │   │   ├── compliance/ # Feature 3: AI Ethics & Compliance
│   │   │   └── settings/   # Admin & Integration settings
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles & Tailwind directives
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Base components (buttons, inputs, cards - Shadcn)
│   │   ├── layout/         # Layout components (Sidebar, Header, TopNav)
│   │   ├── charts/         # Recharts wrapper components
│   │   └── features/       # Feature-specific components
│   ├── lib/                # Utility functions and helpers
│   │   ├── api.ts          # Axios/Fetch API client configuration
│   │   └── utils.ts        # Common utilities (formatting, etc.)
│   ├── hooks/              # Custom React hooks (useAuth, useMetrics)
│   ├── store/              # State management (Zustand or Redux)
│   └── types/              # TypeScript interfaces and types
├── tailwind.config.js      # Tailwind configuration (colors, themes)
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

---

## 3. Backend Project Structure

```text
zenthera-backend/
├── app/
│   ├── api/                # API Routers
│   │   ├── v1/
│   │   │   ├── auth.py     # Authentication endpoints
│   │   │   ├── ingest.py   # High-throughput data ingestion
│   │   │   ├── observability.py # Feature 1 endpoints
│   │   │   ├── behavior.py # Feature 2 endpoints
│   │   │   └── compliance.py # Feature 3 endpoints
│   ├── core/               # Core configuration
│   │   ├── config.py       # Environment variables
│   │   ├── security.py     # JWT, hashing
│   │   └── database.py     # DB connection pooling
│   ├── models/             # SQLAlchemy ORM models
│   │   ├── relational.py   # PostgreSQL models (Users, Projects, Rules)
│   │   └── timeseries.py   # TimescaleDB models (Logs, Events)
│   ├── schemas/            # Pydantic models (Request/Response validation)
│   ├── services/           # Business logic and algorithms
│   │   ├── anomaly_detector.py # Hallucination/Contradiction logic
│   │   ├── friction_analyzer.py # Reprompt loop logic
│   │   └── polaris_engine.py # Compliance checking logic
│   ├── workers/            # Celery/Background tasks
│   │   └── tasks.py        # Async processing tasks
│   └── main.py             # FastAPI application entry point
├── tests/                  # Pytest test suite
├── alembic/                # Database migrations
├── requirements.txt        # Python dependencies
└── Dockerfile              # Container definition
```

---

## 4. Development TODO List

### Phase 1: Project Setup & Infrastructure (Week 1)
- [ ] Initialize Next.js frontend project with TypeScript and Tailwind CSS
- [ ] Configure Shadcn UI for base components
- [ ] Set up frontend routing structure (Auth vs Dashboard)
- [ ] Initialize FastAPI backend project
- [ ] Set up PostgreSQL and TimescaleDB databases via Docker Compose
- [ ] Configure SQLAlchemy and Alembic for database migrations
- [ ] Implement JWT authentication flow (Backend + Frontend)

### Phase 2: Core UI & Dashboard Framework (Week 2)
*Reference: Credo.ai clean, professional, dark/light theme design*
- [ ] Design and implement global layout (Sidebar, Header, Breadcrumbs)
- [ ] Create base UI components (Cards, Data Tables, Status Badges)
- [ ] Implement the Main Executive Dashboard (High-level metrics across all features)
- [ ] Set up Recharts for data visualization (Line charts, Bar charts, Heatmaps)
- [ ] Implement project/tenant selection dropdown in header

### Phase 3: Feature 1 - LLM Observability Engine (Week 3-4)
- [ ] **Backend**: Implement `/api/v1/ingest` endpoint for high-throughput logging
- [ ] **Backend**: Create TimescaleDB schema for interaction logs
- [ ] **Backend**: Implement basic anomaly detection service (mocked algorithms initially)
- [ ] **Frontend**: Build "Interaction Explorer" data table with filtering and pagination
- [ ] **Frontend**: Build "Interaction Detail View" showing prompt/response with highlighted anomalies
- [ ] **Frontend**: Create Observability metrics dashboard (Latency, Token usage, Anomaly rates)

### Phase 4: Feature 2 - User Behavior & Friction Analysis (Week 5-6)
- [ ] **Backend**: Implement client-side event ingestion API
- [ ] **Backend**: Develop reprompt loop detection algorithm
- [ ] **Backend**: Create Alert Rules CRUD API and notification service
- [ ] **Frontend**: Build "Friction Dashboard" showing drop-off rates and frustration signals
- [ ] **Frontend**: Implement "Session Replay" timeline view
- [ ] **Frontend**: Build Alert Management console (Active incidents, Rule configuration)

### Phase 5: Feature 3 - AI Ethics & Compliance (Week 7-8)
- [ ] **Backend**: Implement POLARIS-X compliance engine structure
- [ ] **Backend**: Create database schema for regulatory frameworks (EU AI Act, NIST)
- [ ] **Backend**: Implement evidence upload and management API
- [ ] **Frontend**: Build "Compliance Grid" showing status against specific regulations
- [ ] **Frontend**: Create Policy/Taxonomy editor interface
- [ ] **Frontend**: Implement Evidence Management dashboard

### Phase 6: Integration & Polish (Week 9)
- [ ] Connect frontend charts to real backend API data
- [ ] Implement global error handling and loading states
- [ ] Refine UI/UX to match Credo.ai professional standard (spacing, typography, colors)
- [ ] Conduct end-to-end testing of the ingestion pipeline
- [ ] Prepare Docker images for production deployment

---

## 5. UI Design Guidelines (Credo.ai Inspired)

To achieve the professional SaaS look of Credo.ai, the frontend development must adhere to these guidelines:

1. **Color Palette**:
   - Primary: Deep Navy/Slate (`#0f172a`) for sidebars and primary buttons
   - Background: Off-white/Light Gray (`#f8fafc`) for main content area
   - Surface: Pure White (`#ffffff`) for cards and panels
   - Accents: Electric Blue (`#3b82f6`) or Emerald (`#10b981`) for highlights and active states
   - Status: Red (`#ef4444`) for high risk, Yellow (`#f59e0b`) for warnings, Green (`#10b981`) for compliance

2. **Typography**:
   - Use Inter or Inter-like sans-serif fonts
   - Clear hierarchy: Large, bold headers for sections; readable, high-contrast body text
   - Use subtle gray text (`#64748b`) for secondary information and metadata

3. **Layout Principles**:
   - Card-based UI: Group related information into distinct white cards with subtle shadows
   - Ample whitespace: Do not crowd data; use padding generously (e.g., `p-6` or `p-8` in Tailwind)
   - Clean tables: Borderless rows, sticky headers, clear status indicators (badges/icons)

4. **Data Visualization**:
   - Avoid overly complex charts; prefer clean line graphs and bar charts
   - Use tooltips on hover to show detailed data points
   - Ensure charts have clear legends and axis labels
