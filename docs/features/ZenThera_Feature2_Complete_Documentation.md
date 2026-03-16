# FEATURE 2: USER BEHAVIOR & FRICTION ANALYSIS WITH FAILURE DETECTION & ALERT SYSTEM

## Complete Technical Specification - Final Product

---

## TABLE OF CONTENTS

1. Overview and Purpose
2. User Stories and Requirements
3. Architecture and Event Tracking
4. Friction Detection Algorithms
5. Failure Detection & Alert System
6. Database Schema
7. API Specifications
8. Frontend Components
9. Deployment and Integration
10. FAQ and Implementation Guide

---

## 1. OVERVIEW AND PURPOSE

The User Behavior & Friction Analysis module, integrated with the Failure Detection & Alert System, provides deep insights into how users interact with AI applications. It identifies moments of user frustration, detects systemic failures in real-time, and alerts administrators to broken behaviors before they cause significant user churn or reputational damage.

**Primary Objectives:**

- Track and analyze user interaction patterns with AI features
- Detect friction points such as reprompt loops and session abandonment
- Identify explicit and implicit signals of user frustration
- Classify and alert on systemic failures in real-time
- Generate visual heatmaps of user engagement and friction
- Provide actionable insights for UX and prompt optimization

**Product Status:** This is a complete, production-ready final product specification, designed for enterprise-scale deployment with real-time alerting capabilities.

---

## 2. USER STORIES AND REQUIREMENTS

### User Story 1: Product Manager Optimizing UX

**As a** Product Manager
**I want to** identify where users experience friction when interacting with the AI
**So that** I can improve the UI, prompt templates, or user onboarding

**Acceptance Criteria:**
- Can view heatmaps showing areas of high user friction
- System automatically detects and flags "reprompt loops" (users asking the same thing repeatedly)
- Can see metrics on session abandonment rates correlated with specific AI responses
- Can drill down into specific sessions where friction occurred

### User Story 2: Operations Team Monitoring System Health

**As an** Operations Engineer
**I want to** receive real-time alerts when the AI system exhibits broken behavior
**So that** I can intervene or disable the feature before it impacts more users

**Acceptance Criteria:**
- System detects sudden spikes in error rates or negative user feedback
- Can configure alert thresholds based on failure severity and frequency
- Alerts are routed to appropriate channels (Slack, PagerDuty, Email)
- Can view a dashboard of active alerts and system health status

### User Story 3: UX Researcher Analyzing User Sentiment

**As a** UX Researcher
**I want to** detect implicit and explicit signs of user frustration
**So that** I can understand the emotional impact of AI failures

**Acceptance Criteria:**
- System detects explicit frustration (e.g., user typing "that's not what I asked")
- System detects implicit frustration (e.g., rapid clicking, immediate session close)
- Can view aggregated sentiment scores over time
- Can export frustrated sessions for qualitative analysis

---

## 3. ARCHITECTURE AND EVENT TRACKING

### 3.1 Event Tracking System

The system relies on a comprehensive event tracking architecture that captures both frontend user interactions and backend AI processing events.

**Event Types Captured:**

1. **Interaction Events**: `prompt_submitted`, `response_received`, `feedback_given` (thumbs up/down)
2. **Behavioral Events**: `text_copied`, `response_regenerated`, `chat_cleared`
3. **Navigation Events**: `session_started`, `session_abandoned`, `page_navigated`
4. **System Events**: `api_timeout`, `model_error`, `fallback_triggered`

### 3.2 Data Ingestion Pipeline

1. **Frontend SDK**: A lightweight JavaScript/TypeScript SDK embedded in the client application captures behavioral events.
2. **Backend SDK**: Captures prompt/response data and system events (shared with Feature 1).
3. **Event Aggregator**: A high-throughput ingestion API that receives events, enriches them with session context, and routes them to the processing pipeline.

**Event Payload Schema:**

```json
{
  "event_id": "uuid-v4",
  "timestamp": "2025-03-16T10:35:12.456Z",
  "project_id": "prod_app",
  "session_id": "session-789",
  "user_id_hash": "sha256_hash",
  
  "event_type": "user_feedback",
  "event_data": {
    "interaction_id": "interaction-123",
    "feedback_type": "thumbs_down",
    "feedback_text": "This answer is completely irrelevant.",
    "time_since_response_ms": 4500
  },
  
  "client_context": {
    "user_agent": "Mozilla/5.0...",
    "platform": "web",
    "screen_resolution": "1920x1080"
  }
}
```

---

## 4. FRICTION DETECTION ALGORITHMS

The system uses specialized algorithms to detect various forms of user friction.

### 4.1 Reprompt Loop Detection

Detects when a user is stuck trying to get the AI to understand their request by repeatedly rephrasing the same intent.

**Algorithm Approach: Semantic Similarity over Time**

1. **Session Windowing**: Group prompts by session ID.
2. **Intent Embedding**: Convert each prompt into a dense vector embedding.
3. **Sequential Similarity**: Calculate cosine similarity between consecutive prompts.
4. **Loop Identification**: Flag sequences where similarity remains high but the user continues prompting without positive feedback.

**Pseudocode:**

```python
def detect_reprompt_loops(session_prompts):
    loops = []
    current_loop = []
    
    for i in range(1, len(session_prompts)):
        prev_prompt = session_prompts[i-1]
        curr_prompt = session_prompts[i]
        
        # Calculate semantic similarity
        similarity = cosine_similarity(
            embed(prev_prompt.text), 
            embed(curr_prompt.text)
        )
        
        # High similarity indicates rephrasing the same intent
        if similarity > 0.75:
            if not current_loop:
                current_loop.append(prev_prompt)
            current_loop.append(curr_prompt)
        else:
            # Loop broken
            if len(current_loop) >= 3:  # 3 or more similar prompts = loop
                loops.append({
                    "prompts": current_loop,
                    "duration_seconds": current_loop[-1].timestamp - current_loop[0].timestamp,
                    "severity": "high" if len(current_loop) > 4 else "medium"
                })
            current_loop = []
            
    return loops
```

### 4.2 Frustration Signal Detection

Detects explicit linguistic signals of user frustration in their prompts.

**Algorithm Approach: Linguistic Classifier**

1. **Keyword/Pattern Matching**: Fast detection of common frustration phrases (e.g., "no", "stop", "wrong", "I meant").
2. **Sentiment Analysis**: Evaluate the emotional tone of the prompt.
3. **Frustration Classifier**: A specialized lightweight model trained to distinguish between correction ("No, I meant X") and frustration ("No, you're completely useless").

**Pseudocode:**

```python
def detect_frustration(prompt_text, previous_response):
    # 1. Fast pattern matching
    frustration_patterns = [
        r"\b(no|wrong|incorrect)\b",
        r"\b(not what i (asked|meant|wanted))\b",
        r"\b(stop|halt|cancel)\b",
        r"\b(useless|stupid|bad)\b"
    ]
    
    pattern_matches = sum(1 for p in frustration_patterns if re.search(p, prompt_text.lower()))
    
    # 2. Sentiment analysis
    sentiment = sentiment_model.predict(prompt_text)
    
    # 3. Specialized classifier
    frustration_score = frustration_classifier.predict(
        text=prompt_text, 
        context=previous_response
    )
    
    is_frustrated = (pattern_matches > 0 and sentiment.score < -0.5) or frustration_score > 0.8
    
    return {
        "is_frustrated": is_frustrated,
        "confidence": max(frustration_score, 0.9 if pattern_matches > 0 else 0.0),
        "signals": {
            "patterns_matched": pattern_matches,
            "sentiment": sentiment.score
        }
    }
```

### 4.3 Session Abandonment Detection

Identifies when a user leaves the application immediately following a poor AI interaction.

**Algorithm Approach: Temporal Event Correlation**

1. **Event Sequencing**: Track the sequence of events in a session.
2. **Terminal Event Analysis**: Identify the last interaction before the session ends.
3. **Abandonment Classification**: Classify as "frustrated abandonment" if the terminal event was a negative interaction (e.g., a detected hallucination, a reprompt loop, or explicit negative feedback) followed by a session close within a short timeframe.

---

## 5. FAILURE DETECTION & ALERT SYSTEM

This subsystem monitors the aggregated data for systemic issues and triggers real-time alerts.

### 5.1 Hybrid Failure Classification

Combines rule-based thresholds with LLM-assisted anomaly detection.

**Algorithm Approach:**

1. **Rule-Based Thresholds**: Monitor metrics like error rates, timeout rates, and negative feedback ratios against predefined thresholds (e.g., "Alert if negative feedback > 15% over 10 minutes").
2. **LLM-Assisted Classification**: When a spike in errors or negative feedback is detected, an LLM analyzes a sample of the failing interactions to classify the root cause (e.g., "API Provider Outage", "Prompt Injection Attack", "Model Degradation").

**Pseudocode:**

```python
def evaluate_system_health(time_window_metrics, active_rules):
    alerts = []
    
    for rule in active_rules:
        metric_value = time_window_metrics.get(rule.metric_name)
        
        if metric_value and metric_value > rule.threshold:
            # Threshold breached, investigate root cause
            sample_interactions = fetch_recent_failures(limit=10)
            
            root_cause = llm_classifier.analyze(
                system_prompt="Analyze these failed interactions and determine the root cause...",
                data=sample_interactions
            )
            
            alerts.append({
                "rule_id": rule.id,
                "metric": rule.metric_name,
                "current_value": metric_value,
                "threshold": rule.threshold,
                "root_cause_analysis": root_cause,
                "severity": rule.severity
            })
            
    return alerts
```

### 5.2 Alert Routing and Notification

1. **Alert Deduplication**: Prevents alert fatigue by grouping related alerts and suppressing duplicates within a configurable cooldown period.
2. **Routing Logic**: Routes alerts based on severity and category (e.g., Critical infrastructure alerts to PagerDuty, UX friction alerts to a Slack channel).
3. **Notifier API**: Integrates with external systems (Slack, Teams, PagerDuty, Email, Webhooks).

---

## 6. DATABASE SCHEMA

### PostgreSQL Tables (Configuration and Alerts)

**Alert Rules:**

```sql
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    name VARCHAR(255) NOT NULL,
    metric_name VARCHAR(100) NOT NULL, -- e.g., 'negative_feedback_rate', 'reprompt_loop_count'
    condition VARCHAR(20) NOT NULL, -- '>', '<', '>=', '<='
    threshold DECIMAL(10,4) NOT NULL,
    time_window_minutes INTEGER NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'critical'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Alert Destinations:**

```sql
CREATE TABLE alert_destinations (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    type VARCHAR(50) NOT NULL, -- 'slack', 'email', 'webhook', 'pagerduty'
    config JSONB NOT NULL, -- Stores webhook URLs, channel IDs, etc. (Encrypted)
    is_active BOOLEAN DEFAULT TRUE
);
```

**Alert Rule Destinations (Mapping):**

```sql
CREATE TABLE alert_rule_destinations (
    rule_id UUID REFERENCES alert_rules(id),
    destination_id UUID REFERENCES alert_destinations(id),
    PRIMARY KEY (rule_id, destination_id)
);
```

**Active Alerts (Incident Log):**

```sql
CREATE TABLE incidents (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    rule_id UUID REFERENCES alert_rules(id),
    status VARCHAR(50) NOT NULL, -- 'triggered', 'acknowledged', 'resolved'
    severity VARCHAR(20) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    root_cause_analysis TEXT,
    triggered_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255)
);
```

### TimescaleDB / ClickHouse Tables (Event Data)

**User Events (Hypertable):**

```sql
CREATE TABLE user_events (
    event_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    project_id UUID NOT NULL,
    session_id UUID NOT NULL,
    user_id_hash VARCHAR(255),
    
    event_type VARCHAR(100) NOT NULL,
    interaction_id UUID, -- Links to interactions table in Feature 1
    
    -- Friction Indicators
    is_frustration_signal BOOLEAN DEFAULT FALSE,
    is_reprompt BOOLEAN DEFAULT FALSE,
    is_abandonment BOOLEAN DEFAULT FALSE,
    
    event_data JSONB,
    
    PRIMARY KEY (event_id, timestamp)
);

SELECT create_hypertable('user_events', 'timestamp');
CREATE INDEX idx_session_events ON user_events (session_id, timestamp);
CREATE INDEX idx_friction ON user_events (project_id, timestamp DESC) WHERE is_frustration_signal = TRUE OR is_reprompt = TRUE;
```

---

## 7. API SPECIFICATIONS

### POST /api/v1/events

Ingests user behavioral events from the client SDK.

**Request:**

```json
{
  "project_id": "prod_app",
  "events": [
    {
      "timestamp": "2025-03-16T10:35:12.456Z",
      "session_id": "session-789",
      "event_type": "text_copied",
      "interaction_id": "interaction-123",
      "event_data": {
        "text_length": 150
      }
    }
  ]
}
```

**Response:** `202 Accepted`

### GET /api/v1/analytics/friction

Retrieves aggregated friction metrics for the dashboard.

**Query Parameters:**
- `project_id`: Filter by project
- `time_range`: e.g., '24h', '7d'

**Response:**

```json
{
  "summary": {
    "total_sessions": 5000,
    "sessions_with_friction": 450,
    "friction_rate": 0.09,
    "avg_reprompts_per_session": 1.2
  },
  "friction_types": {
    "reprompt_loops": 210,
    "explicit_frustration": 85,
    "abandonment": 155
  },
  "trend": [
    {"timestamp": "2025-03-16T00:00:00Z", "friction_rate": 0.08},
    {"timestamp": "2025-03-16T01:00:00Z", "friction_rate": 0.12}
  ]
}
```

### GET /api/v1/alerts

Retrieves active and historical alerts.

**Response:**

```json
{
  "active_alerts": [
    {
      "incident_id": "uuid",
      "rule_name": "High Negative Feedback Rate",
      "severity": "critical",
      "triggered_at": "2025-03-16T10:30:00Z",
      "current_value": 0.18,
      "threshold": 0.15,
      "root_cause_summary": "Users are reporting that the model is failing to format JSON correctly."
    }
  ]
}
```

---

## 8. FRONTEND COMPONENTS

### 1. User Behavior Dashboard

**Overview:**
- **Friction Score**: A composite metric indicating overall UX health.
- **Friction Funnel**: Visual representation of where users drop off (e.g., Prompt -> Response -> Reprompt -> Abandonment).
- **Top Friction Drivers**: List of the most common topics or intents that lead to frustration.

### 2. Heatmap Aggregator

**Features:**
- Visual representation of user engagement and friction.
- **Topic Heatmap**: Shows which topics generate the most engagement vs. the most friction.
- **Temporal Heatmap**: Shows times of day or days of the week with highest error rates or frustration signals.

### 3. Session Replay Viewer

**Features:**
- Step-by-step timeline of a specific user session.
- Displays prompts, responses, and behavioral events (clicks, copies, feedback) in chronological order.
- Highlights detected friction points (e.g., a red flag on a reprompt loop).

### 4. Alert Management Console

**Features:**
- **Active Incidents Board**: Kanban-style board for managing active alerts (Triggered, Investigating, Resolved).
- **Rule Configuration Builder**: UI for creating and editing alert rules (Metric selection, threshold setting, destination mapping).
- **Integration Settings**: Manage connections to Slack, PagerDuty, etc.

---

## 9. DEPLOYMENT AND INTEGRATION

### Alert Processing Architecture

1. **Metrics Aggregator**: A background job (e.g., Celery beat or a dedicated Go service) runs every minute, querying TimescaleDB to calculate current metric values for the defined time windows.
2. **Rule Engine**: Evaluates the aggregated metrics against active alert rules.
3. **LLM Analyzer**: If a rule is breached, triggers an asynchronous task to fetch sample data and perform root cause analysis using an LLM.
4. **Notifier Service**: Formats the alert payload and dispatches it to the configured destinations (Slack API, SendGrid, etc.).

### Integration with Feature 1

Feature 2 builds directly on top of the data ingested by Feature 1 (LLM Observability Engine).
- Feature 1 provides the core interaction data (prompts, responses, latency).
- Feature 2 adds the behavioral context (client-side events) and the analytical layer (friction detection, alerting).
- Both features share the same TimescaleDB infrastructure for efficient time-series querying.

---

## 10. FAQ AND IMPLEMENTATION GUIDE

### Q: How does the system distinguish between a user refining a prompt and a user stuck in a reprompt loop?
**A:** The reprompt loop algorithm looks for high semantic similarity combined with a lack of positive behavioral signals (like copying the text or providing a thumbs up). If a user refines a prompt and then uses the result, it's considered successful refinement. If they refine it 4 times and then abandon the session, it's classified as a friction loop.

### Q: Can I set up alerts for specific user segments?
**A:** Yes, alert rules can be scoped using filters. For example, you can create a rule that only triggers if the error rate spikes for users with a specific `tenant_id` or `subscription_tier`.

### Q: How quickly are alerts triggered?
**A:** The metrics aggregator runs on a 1-minute interval by default. Therefore, an alert will typically be triggered within 1-2 minutes of the threshold being breached, depending on the configured time window for the rule.

### Q: Does the client SDK affect page load times?
**A:** No, the frontend SDK is extremely lightweight (< 10kb gzipped) and sends event batches asynchronously using the `navigator.sendBeacon()` API or background fetch, ensuring zero impact on application performance or page unloads.
