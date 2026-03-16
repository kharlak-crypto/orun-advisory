# FEATURE 1: LLM OBSERVABILITY ENGINE

## Complete Technical Specification - Final Product

---

## TABLE OF CONTENTS

1. Overview and Purpose
2. User Stories and Requirements
3. Architecture and Data Ingestion
4. Core Detection Algorithms
5. Database Schema
6. API Specifications
7. Frontend Components
8. Deployment and Integration
9. FAQ and Implementation Guide

---

## 1. OVERVIEW AND PURPOSE

The LLM Observability Engine is the foundational layer of ZenThera IO, designed to monitor, analyze, and evaluate interactions between users and Large Language Models (LLMs) in real-time. It acts as a continuous quality assurance system that detects anomalies such as hallucinations, contradictions, ambiguity, and performance issues without interfering with the primary application flow.

**Primary Objectives:**

- Capture and log all LLM prompts and responses
- Detect hallucinations and factual inconsistencies
- Identify contradictions within model outputs
- Flag ambiguous or unclear responses
- Monitor performance metrics (latency, timeouts)
- Provide actionable insights for prompt engineering and model fine-tuning

**Product Status:** This is a complete, production-ready final product specification, designed for enterprise-scale deployment with high throughput and low latency requirements.

---

## 2. USER STORIES AND REQUIREMENTS

### User Story 1: AI/ML Engineer Monitoring Model Quality

**As an** AI/ML Engineer
**I want to** monitor the quality of LLM responses in real-time
**So that** I can detect hallucinations and contradictions before they impact users

**Acceptance Criteria:**
- Can view a real-time stream of all LLM interactions
- System automatically flags potential hallucinations with confidence scores
- System highlights contradictory statements within responses
- Can filter interactions by anomaly type, severity, and model version
- Can export flagged interactions for model fine-tuning

### User Story 2: Product Manager Analyzing User Experience

**As a** Product Manager
**I want to** understand when the LLM provides ambiguous or unhelpful answers
**So that** I can improve prompt templates and system instructions

**Acceptance Criteria:**
- Can see aggregate metrics on response clarity and ambiguity
- Can view specific examples of ambiguous responses
- Can track ambiguity rates across different use cases or features
- Can correlate ambiguity with user feedback or abandonment

### User Story 3: DevOps Engineer Monitoring Performance

**As a** DevOps Engineer
**I want to** track LLM latency, timeouts, and error rates
**So that** I can ensure system reliability and manage API costs

**Acceptance Criteria:**
- Can view real-time latency metrics (p50, p90, p99)
- System alerts on abnormal timeout rates or API errors
- Can track token usage and estimated costs per interaction
- Can compare performance across different LLM providers (OpenAI, Anthropic, etc.)

---

## 3. ARCHITECTURE AND DATA INGESTION

### 3.1 Non-Invasive Architecture

The LLM Observability Engine is designed to be completely non-invasive. It operates asynchronously and out-of-band, ensuring that monitoring never adds latency to the user experience or blocks the primary application flow.

### 3.2 Data Ingestion Methods

ZenThera IO supports three methods for capturing LLM interactions:

#### Method 1: Lightweight SDK (Recommended)

A drop-in replacement or wrapper for standard LLM client libraries (e.g., OpenAI Python SDK).

**Implementation Example (Python):**

```python
from zenthera import ZenTheraClient
import openai

# Initialize ZenThera client
zt_client = ZenTheraClient(api_key="zt_api_key", project_id="prod_app")

# Wrap the OpenAI client
client = zt_client.wrap_openai(openai.Client(api_key="sk-..."))

# Use normally - ZenThera logs asynchronously in the background
response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[{"role": "user", "content": "Explain quantum computing."}]
)
```

#### Method 2: Shadow Proxy

A reverse proxy that sits between the application and the LLM provider. The application sends requests to the proxy, which forwards them to the provider and asynchronously logs the interaction to ZenThera.

**Configuration:**
- Application changes base URL to `https://proxy.zenthera.io/v1`
- Adds header `X-ZenThera-Project: prod_app`
- No code changes required

#### Method 3: Asynchronous Webhooks

For systems with existing logging infrastructure, interactions can be pushed to ZenThera via webhooks after they occur.

### 3.3 Interaction Data Schema

All ingested data is normalized into a standard schema:

```json
{
  "interaction_id": "uuid-v4",
  "timestamp": "2025-03-16T10:30:45.123Z",
  "project_id": "prod_app",
  "environment": "production",
  
  "user_context": {
    "user_id_hash": "sha256_hash_for_privacy",
    "session_id": "uuid-v4",
    "client_ip_hash": "sha256_hash"
  },
  
  "model_context": {
    "provider": "openai",
    "model": "gpt-4-turbo",
    "temperature": 0.7,
    "max_tokens": 1000
  },
  
  "content": {
    "system_prompt": "You are a helpful assistant...",
    "user_prompt": "Explain quantum computing.",
    "response": "Quantum computing is a type of computation...",
    "context_documents": ["doc1_text", "doc2_text"]
  },
  
  "performance": {
    "latency_ms": 1250,
    "time_to_first_token_ms": 350,
    "prompt_tokens": 45,
    "completion_tokens": 350,
    "total_tokens": 395,
    "status_code": 200
  }
}
```

---

## 4. CORE DETECTION ALGORITHMS

The engine uses specialized classifiers to detect four primary types of anomalies.

### 4.1 Hallucination Detection

Detects when the model generates information that is factually incorrect or unsupported by the provided context.

**Algorithm Approach: Semantic Consistency Checking**

1. **Context Extraction**: Extract key claims from the model's response.
2. **Grounding Verification**: Compare claims against provided context documents (RAG scenarios) or a trusted knowledge base.
3. **Entailment Scoring**: Use a Natural Language Inference (NLI) model to determine if the context entails, contradicts, or is neutral to the claim.

**Pseudocode:**

```python
def detect_hallucination(response, context_documents=None):
    # Step 1: Extract verifiable claims
    claims = claim_extractor_model.extract(response)
    
    hallucinations = []
    
    for claim in claims:
        if context_documents:
            # RAG Scenario: Check against provided context
            entailment_score = nli_model.predict(
                premise=" ".join(context_documents),
                hypothesis=claim
            )
            
            # If context does not support the claim
            if entailment_score['entailment'] < 0.3 and entailment_score['contradiction'] > 0.5:
                hallucinations.append({
                    "claim": claim,
                    "confidence": entailment_score['contradiction'],
                    "type": "unsupported_by_context"
                })
        else:
            # General Scenario: Self-consistency check (SelfCheckGPT approach)
            # Generate multiple responses to the same prompt and check for consistency
            consistency_score = calculate_self_consistency(claim, prompt)
            if consistency_score < 0.4:
                hallucinations.append({
                    "claim": claim,
                    "confidence": 1.0 - consistency_score,
                    "type": "factual_inconsistency"
                })
                
    return {
        "has_hallucination": len(hallucinations) > 0,
        "details": hallucinations,
        "overall_risk_score": max([h['confidence'] for h in hallucinations]) if hallucinations else 0.0
    }
```

### 4.2 Contradiction Detection

Detects when the model contradicts itself within the same response or across a single conversation session.

**Algorithm Approach: Intra-Response NLI**

1. **Sentence Segmentation**: Split the response into individual sentences or propositions.
2. **Pairwise Comparison**: Compare every sentence against every other sentence using an NLI model.
3. **Conflict Flagging**: Flag pairs with high contradiction scores.

**Pseudocode:**

```python
def detect_contradiction(response):
    sentences = sentence_segmenter(response)
    contradictions = []
    
    # Compare each sentence with subsequent sentences
    for i in range(len(sentences)):
        for j in range(i+1, len(sentences)):
            premise = sentences[i]
            hypothesis = sentences[j]
            
            # Check if sentence J contradicts sentence I
            nli_result = nli_model.predict(premise, hypothesis)
            
            if nli_result['contradiction'] > 0.8:
                contradictions.append({
                    "statement_1": premise,
                    "statement_2": hypothesis,
                    "confidence": nli_result['contradiction']
                })
                
    return {
        "has_contradiction": len(contradictions) > 0,
        "details": contradictions,
        "overall_risk_score": max([c['confidence'] for c in contradictions]) if contradictions else 0.0
    }
```

### 4.3 Ambiguity Detection

Detects responses that are vague, evasive, or fail to directly answer the user's prompt.

**Algorithm Approach: Clarity Metrics and Intent Matching**

1. **Intent Extraction**: Determine the core intent or question in the user's prompt.
2. **Directness Scoring**: Evaluate if the response directly addresses the intent.
3. **Linguistic Analysis**: Detect hedging language (e.g., "It depends," "I'm not sure," "However").

**Pseudocode:**

```python
def detect_ambiguity(prompt, response):
    # Step 1: Extract user intent
    user_intent = intent_classifier.predict(prompt)
    
    # Step 2: Check for hedging language
    hedging_phrases = ["it depends", "might be", "could potentially", "not entirely clear"]
    hedging_count = sum(1 for phrase in hedging_phrases if phrase in response.lower())
    hedging_score = min(hedging_count * 0.2, 1.0)
    
    # Step 3: Evaluate directness
    directness_score = qa_evaluation_model.score(question=prompt, answer=response)
    
    # Calculate overall ambiguity
    # High hedging and low directness = high ambiguity
    ambiguity_score = (hedging_score * 0.4) + ((1.0 - directness_score) * 0.6)
    
    return {
        "is_ambiguous": ambiguity_score > 0.6,
        "score": ambiguity_score,
        "hedging_detected": hedging_count > 0,
        "directness_score": directness_score
    }
```

### 4.4 Performance and Timeout Detection

Monitors operational metrics to detect degradation in service quality.

**Algorithm Approach: Statistical Anomaly Detection**

1. **Baseline Establishment**: Maintain rolling averages for latency and token generation speed per model.
2. **Z-Score Analysis**: Flag interactions that deviate significantly from the baseline.
3. **Error Classification**: Categorize API errors, timeouts, and rate limits.

**Pseudocode:**

```python
def detect_performance_anomaly(interaction_metrics, historical_baselines):
    model = interaction_metrics['model']
    baseline = historical_baselines[model]
    
    latency = interaction_metrics['latency_ms']
    tokens = interaction_metrics['total_tokens']
    
    # Calculate tokens per second
    tps = tokens / (latency / 1000.0) if latency > 0 else 0
    
    anomalies = []
    
    # Check latency anomaly (Z-score > 3)
    latency_z_score = (latency - baseline['mean_latency']) / baseline['std_latency']
    if latency_z_score > 3.0:
        anomalies.append({
            "type": "high_latency",
            "value": latency,
            "expected": baseline['mean_latency'],
            "severity": "high" if latency_z_score > 5.0 else "medium"
        })
        
    # Check API errors
    if interaction_metrics['status_code'] != 200:
        anomalies.append({
            "type": "api_error",
            "code": interaction_metrics['status_code'],
            "severity": "critical"
        })
        
    return {
        "has_anomaly": len(anomalies) > 0,
        "details": anomalies
    }
```

---

## 5. DATABASE SCHEMA

The Observability Engine uses a hybrid database approach: PostgreSQL for relational metadata and TimescaleDB (or ClickHouse) for high-volume time-series interaction logs.

### PostgreSQL Tables (Metadata and Configuration)

**Projects:**

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB
);
```

**Anomaly Rules:**

```sql
CREATE TABLE anomaly_rules (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    anomaly_type VARCHAR(50) NOT NULL, -- hallucination, contradiction, etc.
    threshold DECIMAL(5,4) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    action VARCHAR(50) -- log, alert, block
);
```

### TimescaleDB / ClickHouse Tables (High-Volume Logs)

**Interactions (Hypertable):**

```sql
CREATE TABLE interactions (
    interaction_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    project_id UUID NOT NULL,
    session_id UUID,
    user_id_hash VARCHAR(255),
    
    -- Model Details
    provider VARCHAR(50),
    model VARCHAR(100),
    
    -- Content (Stored in compressed format or external object storage for large payloads)
    prompt_text TEXT,
    response_text TEXT,
    
    -- Metrics
    latency_ms INTEGER,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    
    -- Anomaly Scores
    hallucination_score DECIMAL(5,4),
    contradiction_score DECIMAL(5,4),
    ambiguity_score DECIMAL(5,4),
    has_anomaly BOOLEAN,
    
    PRIMARY KEY (interaction_id, timestamp)
);

-- Create hypertable for time-series optimization
SELECT create_hypertable('interactions', 'timestamp');

-- Indexes for fast querying
CREATE INDEX idx_project_time ON interactions (project_id, timestamp DESC);
CREATE INDEX idx_session ON interactions (session_id, timestamp);
CREATE INDEX idx_anomalies ON interactions (project_id, timestamp DESC) WHERE has_anomaly = TRUE;
```

**Anomaly Details:**

```sql
CREATE TABLE anomaly_details (
    id UUID PRIMARY KEY,
    interaction_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    anomaly_type VARCHAR(50) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    details JSONB NOT NULL -- Stores specific claims, sentences, etc.
);

SELECT create_hypertable('anomaly_details', 'timestamp');
```

---

## 6. API SPECIFICATIONS

### POST /api/v1/ingest

Ingests a new LLM interaction asynchronously.

**Request:**

```json
{
  "project_id": "prod_app",
  "timestamp": "2025-03-16T10:30:45.123Z",
  "session_id": "session-123",
  "model": "gpt-4-turbo",
  "prompt": "Explain quantum computing.",
  "response": "Quantum computing is...",
  "metrics": {
    "latency_ms": 1250,
    "total_tokens": 395
  }
}
```

**Response:** `202 Accepted` (Processing happens asynchronously)

### GET /api/v1/interactions

Retrieves logged interactions with filtering.

**Query Parameters:**
- `project_id`: Filter by project
- `start_time`, `end_time`: Time range
- `has_anomaly`: Boolean
- `anomaly_type`: hallucination, contradiction, ambiguity
- `min_severity`: low, medium, high
- `limit`, `offset`: Pagination

**Response:**

```json
{
  "data": [
    {
      "interaction_id": "uuid",
      "timestamp": "2025-03-16T10:30:45.123Z",
      "prompt_snippet": "Explain quantum...",
      "response_snippet": "Quantum computing...",
      "anomalies": [
        {
          "type": "hallucination",
          "confidence": 0.85,
          "severity": "high"
        }
      ]
    }
  ],
  "pagination": {
    "total": 1500,
    "limit": 50,
    "offset": 0
  }
}
```

### GET /api/v1/analytics/anomalies

Retrieves aggregated anomaly metrics for dashboards.

**Response:**

```json
{
  "time_series": [
    {
      "timestamp": "2025-03-16T10:00:00Z",
      "total_interactions": 150,
      "hallucinations": 5,
      "contradictions": 2,
      "ambiguities": 12
    }
  ],
  "summary": {
    "hallucination_rate": 0.033,
    "contradiction_rate": 0.013,
    "ambiguity_rate": 0.08
  }
}
```

---

## 7. FRONTEND COMPONENTS

### 1. Observability Dashboard

**Overview:**
- High-level metrics: Total interactions, average latency, total cost
- Anomaly rate trend charts (line graphs showing hallucination/contradiction rates over time)
- Recent critical anomalies feed

### 2. Interaction Explorer (Table View)

**Features:**
- Tabular view of all interactions
- Columns: Timestamp, Session ID, Prompt (truncated), Response (truncated), Latency, Risk Icons
- **Risk Icons**: Visual indicators (e.g., color-coded badges) for detected anomalies
  - Red: High confidence hallucination/contradiction
  - Yellow: Medium confidence or ambiguity
  - Green: Clean interaction
- Advanced filtering panel (by date, model, anomaly type, user ID)

### 3. Interaction Detail View

**Features:**
- Full text of prompt and response
- **Highlighted Text**: Specific sentences flagged as hallucinations or contradictions are highlighted in the response text.
- **Anomaly Explanation Panel**: Side panel explaining *why* text was flagged (e.g., "Statement contradicts context document X").
- Raw JSON payload view for debugging.

### 4. Analytics & Reporting

**Features:**
- Model comparison charts (e.g., GPT-4 vs Claude 3 anomaly rates)
- Prompt performance analysis (which prompt templates generate the most ambiguity)
- Export functionality (CSV/JSON) for fine-tuning datasets.

---

## 8. DEPLOYMENT AND INTEGRATION

### Data Pipeline Architecture

To handle high throughput without dropping data, the ingestion pipeline uses a message queue:

1. **API Gateway**: Receives ingestion requests (FastAPI)
2. **Message Queue**: Kafka or Redis Streams buffers incoming data
3. **Worker Nodes**: Celery or Python workers consume messages, run detection algorithms, and write to database
4. **Storage**: TimescaleDB for metrics, Elasticsearch for full-text search of prompts/responses

### Docker Compose (Development/Testing)

```yaml
version: '3.8'
services:
  api:
    image: zenthera/obs-api
    ports: ["8000:8000"]
    environment:
      - KAFKA_BROKER=kafka:9092
      - DB_URL=postgres://user:pass@timescaledb:5432/zenthera
  
  worker:
    image: zenthera/obs-worker
    environment:
      - KAFKA_BROKER=kafka:9092
      - DB_URL=postgres://user:pass@timescaledb:5432/zenthera
      - MODEL_ENDPOINT=http://inference:8080
      
  timescaledb:
    image: timescale/timescaledb:latest-pg14
    ports: ["5432:5432"]
    
  kafka:
    image: confluentinc/cp-kafka:latest
    # Kafka config...
```

---

## 9. FAQ AND IMPLEMENTATION GUIDE

### Q: Will the observability engine slow down my application?
**A:** No. The SDK and Shadow Proxy are designed to be completely asynchronous. The application receives the LLM response immediately, while ZenThera processes the logging and anomaly detection in the background.

### Q: How accurate are the hallucination and contradiction detectors?
**A:** The NLI-based models are highly accurate for explicit contradictions and context-grounded hallucinations (RAG). For open-ended factual hallucinations without provided context, the system relies on self-consistency checks, which provide a strong probabilistic indicator but may require human review for edge cases.

### Q: Can I use my own models for detection?
**A:** Yes, the enterprise version allows configuring custom endpoints for the NLI and classifier models used in the detection pipeline, allowing you to use self-hosted models for data privacy.

### Q: How is PII (Personally Identifiable Information) handled?
**A:** The SDK includes a pre-processing step that can hash or redact PII (emails, phone numbers, SSNs) before the prompt/response payload is sent to the ZenThera ingestion API. User IDs and IP addresses are hashed by default.
