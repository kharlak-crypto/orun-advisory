# ZenThera IO: Complete Step-by-Step Guide to Production

**Version:** 1.0 | **Date:** March 17, 2026 | **Status:** Final Product

This guide is designed for non-technical users who need to deploy, configure, and manage ZenThera IO without a development team. It covers every step from initial setup to client delivery.

---

## Table of Contents

1. Understanding the Architecture
2. Publishing Your Application
3. Configuring Your Custom Domain
4. Setting Up Client Login
5. Loading Initial Data
6. Connecting Your Client's LLM
7. Testing Each Feature End-to-End
8. Delivering to Your Client
9. Ongoing Maintenance
10. Troubleshooting Common Issues
11. Security Checklist
12. Frequently Asked Questions

---

## 1. Understanding the Architecture

ZenThera IO is a full-stack web application built with the following components:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | React 19 + TypeScript + Tailwind CSS 4 | User interface with dark sidebar navigation |
| Backend | Express 4 + tRPC 11 | API server handling all business logic |
| Database | MySQL/TiDB (cloud-managed) | Stores all interactions, alerts, compliance data |
| Authentication | Manus OAuth | Secure login system for your clients |
| Hosting | Manus Platform | Built-in hosting with SSL and CDN |

The application follows a **non-invasive architecture**, meaning it monitors LLM interactions without requiring changes to your client's existing AI systems. There are three integration methods available:

**Shadow Proxy** intercepts API calls transparently by sitting between the client application and the LLM provider. No code changes are required on the client side.

**SDK Integration** involves adding a lightweight JavaScript/Python library to the client's application that sends interaction logs to ZenThera in the background.

**Webhook/Log File Upload** allows the client to export their LLM interaction logs as TXT or JSON files and upload them directly through the ZenThera dashboard.

---

## 2. Publishing Your Application

The application is currently running in development mode. To make it available to your clients, you need to publish it.

**Step 1:** Open the ZenThera IO project in the Manus management interface. You will see the project card with a "View" button that opens the preview panel.

**Step 2:** Click the "Publish" button located in the top-right corner of the Management UI header. This button becomes available after a checkpoint has been saved.

**Step 3:** Wait for the deployment to complete. The system will build the production version of the application, optimize all assets, and deploy it to the Manus hosting infrastructure. This process typically takes 2 to 5 minutes.

**Step 4:** Once published, your application will be accessible at a URL like `https://zenthera-io.manus.space`. This URL is immediately functional with SSL encryption enabled by default.

---

## 3. Configuring Your Custom Domain

To present a professional image to your clients, you should configure a custom domain such as `app.zenthera.io` or `dashboard.zenthera.io`.

**Step 1:** Open the Management UI and navigate to Settings, then select the Domains sub-panel from the side navigation.

**Step 2:** You have three options for domain configuration:

**Option A: Modify the auto-generated domain prefix.** By default, the application is accessible at `zenthera-io.manus.space`. You can change the prefix to something more professional like `app-zenthera.manus.space`.

**Option B: Purchase a new domain directly within Manus.** The platform allows you to search for and purchase domains without leaving the interface. Simply search for your desired domain name, complete the purchase, and it will be automatically assigned to your application.

**Option C: Bind an existing custom domain.** If you already own a domain (for example, `zenthera.io`), you can bind it by adding a CNAME record in your domain registrar's DNS settings. The Management UI will provide the exact CNAME value to use.

**Step 3:** After configuring the domain, SSL certificates are automatically provisioned. Allow up to 30 minutes for DNS propagation and certificate issuance.

---

## 4. Setting Up Client Login

ZenThera IO uses Manus OAuth for authentication. When a client visits your application, they will see a professional landing page with a "Sign In" button. The login flow works as follows:

**Step 1:** The client clicks "Sign In" or "Get Started" on the landing page.

**Step 2:** They are redirected to the Manus OAuth portal where they can create an account or sign in with existing credentials.

**Step 3:** After successful authentication, they are redirected back to the ZenThera dashboard with full access to all features.

**Managing User Roles:** The system supports two roles: "user" (default) and "admin". The application owner (you) is automatically assigned the admin role. To promote a client user to admin, navigate to the Database panel in the Management UI, find the user in the "users" table, and change their "role" field from "user" to "admin".

**Important:** The first time you log in, you are automatically registered as the owner with admin privileges. All subsequent users who sign in will receive the default "user" role.

---

## 5. Loading Initial Data

Before presenting the application to your client, you should populate it with demonstration data so they can see how the platform works.

**Step 1:** Log in to the ZenThera dashboard as the admin user.

**Step 2:** On the Executive Dashboard page, click the "Load Demo Data" button in the top-right corner.

**Step 3:** The system will populate the database with 60 LLM interaction records across 4 models (GPT-4o, Claude 3.5 Sonnet, Gemini Pro, Llama 3.1), including various anomaly types (hallucinations, contradictions, ambiguity, timeouts). It will also create 50 user behavior sessions with friction events, 12 alerts with different severity levels, 4 compliance frameworks (EU AI Act with 12 articles, NIST AI RMF with 10 requirements, ISO 42001 with 10 requirements, GDPR with 8 requirements), and 15 ethics events.

**Step 4:** Navigate through each page to verify the data is displayed correctly. The dashboard should show KPI cards with real numbers, charts with trend data, and tables with detailed records.

---

## 6. Connecting Your Client's LLM

This is the most critical step. ZenThera monitors your client's LLM by analyzing their interaction logs. There are three methods to connect:

### Method A: Log File Upload (Simplest, No Code Required)

This method is ideal for initial demonstrations and clients who want to test ZenThera before committing to a deeper integration.

**Step 1:** Navigate to the "LLM Observability" page in the dashboard.

**Step 2:** At the top of the page, you will see the "Ingest LLM Logs" section with an "Upload Log File" button.

**Step 3:** Prepare a log file in one of the supported formats. The simplest format is a TXT file with one JSON object per line. Each line should contain the following fields:

```
{"timestamp":"2026-03-17T10:00:00Z","model":"gpt-4o","prompt":"What is the refund policy?","response":"Our refund policy allows returns within 30 days...","latencyMs":1200,"tokenCount":150,"userId":"user-001","sessionId":"sess-001"}
```

A sample log file is included in the project at `test-data/llm-simulation-logs.txt` with 20 realistic interaction records that you can use as a template.

**Step 4:** Click "Upload Log File" and select your TXT or JSON file. The system will parse each interaction, run anomaly detection algorithms, and display the results in the Interaction Explorer table.

### Method B: SDK Integration (Recommended for Production)

For production use, the client adds a lightweight SDK to their application that automatically sends interaction logs to ZenThera.

**Step 1:** Navigate to Settings and select the "Integration Methods" tab.

**Step 2:** Copy the SDK installation command and the configuration snippet provided.

**Step 3:** The client's development team adds the SDK to their application. The SDK intercepts LLM API calls and sends a copy of the prompt, response, latency, and metadata to ZenThera's ingestion endpoint.

**Step 4:** Once the SDK is installed, interactions will appear in real-time on the LLM Observability page.

### Method C: Shadow Proxy (Zero Code Changes)

The shadow proxy sits between the client's application and the LLM provider, transparently capturing all interactions.

**Step 1:** Navigate to Settings and select the "Integration Methods" tab.

**Step 2:** Copy the proxy endpoint URL provided.

**Step 3:** The client changes their LLM API base URL from the provider's URL (e.g., `https://api.openai.com/v1`) to ZenThera's proxy URL. All requests are forwarded to the original provider, and a copy is stored for analysis.

### Configuring the LLM Connection

Regardless of the integration method, you should configure the LLM connection in Settings:

**Step 1:** Navigate to Settings and select the "LLM Connection" tab.

**Step 2:** Select the provider (OpenAI, Anthropic, Google, or Meta) and the specific model.

**Step 3:** Enter the API key. This key is encrypted and stored securely. It is used only for shadow monitoring and verification purposes.

**Step 4:** Optionally, enter a custom endpoint URL if the client uses Azure OpenAI or a self-hosted model.

**Step 5:** Click "Save & Verify" to test the connection.

---

## 7. Testing Each Feature End-to-End

Before delivering to your client, verify that each feature is working correctly.

### Feature 1: LLM Observability Engine

**What to test:** Navigate to the LLM Observability page. You should see four KPI cards at the top showing counts of Hallucinations, Contradictions, Ambiguity Flags, and Timeouts detected in the last 7 days.

**Expected behavior:** The Anomaly Detection Trend chart shows a bar chart with color-coded anomaly types over the last 24 hours. The Interaction Explorer table lists all captured interactions with columns for ID, Timestamp, Model, Prompt (truncated), Anomaly Type, Severity (color-coded as Critical/High/Medium/Low), Confidence percentage, and Latency.

**How to verify:** Upload the sample log file from `test-data/llm-simulation-logs.txt`. After upload, new interactions should appear in the table. Filter by anomaly type using the dropdown to confirm filtering works. Click "View" on any interaction to see the full details.

### Feature 2: User Behavior & Friction Analysis

**What to test:** Navigate to the User Behavior page (under the "User Behavior" sidebar menu). You should see KPI cards for Active Sessions, Friction Rate, Abandonment Rate, and Average Satisfaction Score.

**Expected behavior:** The Overview tab shows a "Friction Signals Over Time" line chart and a "Session Outcomes" donut chart. The "Feature Heatmap" tab shows a visual grid of feature usage intensity. The "Friction Events" tab lists individual friction events with type, description, session ID, and timestamp.

**How to verify:** Check that the Friction Rate and Abandonment Rate percentages match the demo data (approximately 16% friction, 14% abandonment). Switch between tabs to confirm all three views load correctly.

### Feature 2.1: Failure Detection & Alert System

**What to test:** Navigate to the Failure Detection page (under "User Behavior" > "Failure Detection"). You should see KPI cards for Active Alerts, Investigating, Resolved, and Total Alerts.

**Expected behavior:** The Alert Severity Distribution chart shows a bar chart with Critical, High, Medium, and Low counts. The Alert Log lists all alerts with their name, severity badge, status badge, description, source model, and timestamp. Each active alert has "Investigate", "Resolve", and "Dismiss" action buttons. The Alert Rules Configuration section at the bottom shows 8 configurable rules with toggle switches.

**How to verify:** Click "Investigate" on an active alert. The status should change to "investigating". Click "Resolve" on an investigating alert. The status should change to "resolved". Toggle an alert rule on/off to confirm the switches work.

### Feature 3: AI Ethics & Compliance

**What to test:** Navigate to the AI Ethics & Compliance page. You should see an Overall Compliance score (approximately 78%) and individual scores for EU AI Act (72%), GDPR (90%), ISO 42001 (65%), and NIST AI RMF (85%).

**Expected behavior:** The Compliance Checklist tab shows all requirements organized by framework with article numbers, descriptions, XAI explanations (in italics), coverage progress bars, and status dropdowns. The Ethics Events tab lists detected ethics violations. The Evidence Documents tab shows uploaded compliance evidence. The Compliance Radar tab shows a visual radar chart of compliance across categories.

**How to verify:** In the Compliance Checklist, change a requirement's status from "Partial" to "Compliant" using the dropdown. The overall compliance score should update. Filter by framework to confirm filtering works. Switch to the Ethics Events tab to verify ethics event data is displayed.

---

## 8. Delivering to Your Client

When presenting ZenThera to your client, follow this recommended sequence:

**Preparation Meeting (30 minutes):** Explain the three integration methods and help the client choose the best option for their infrastructure. Most clients start with Log File Upload for a proof of concept, then move to SDK Integration for production.

**Initial Demo (1 hour):** Walk the client through the dashboard using the demo data. Show each feature and explain how it addresses their specific AI governance needs. Highlight the compliance frameworks relevant to their industry and jurisdiction.

**Integration Setup (1-2 hours):** Help the client configure their first LLM connection. If using Log File Upload, help them format their first log file. If using SDK Integration, provide the integration guide to their development team.

**Validation Period (1-2 weeks):** Allow the client to run ZenThera alongside their existing AI systems. During this period, monitor the dashboard for any issues and adjust alert rules based on their specific thresholds.

**Production Handoff:** Once the client is satisfied with the validation results, transition to full production monitoring. Set up notification preferences and establish a regular review cadence for compliance reports.

---

## 9. Ongoing Maintenance

ZenThera IO is designed to be low-maintenance, but there are some regular tasks you should perform.

**Weekly:** Review the Executive Dashboard for any unusual trends. Check that all LLM connections are active in Settings. Review and address any critical or high-severity alerts.

**Monthly:** Generate compliance reports for each framework. Review and update compliance requirement statuses based on the client's progress. Upload any new evidence documents for audit trail purposes.

**Quarterly:** Review alert rule thresholds and adjust based on historical data. Update the ethics taxonomy if new risk categories emerge. Conduct a comprehensive compliance review across all frameworks.

**As Needed:** When regulatory requirements change (such as new EU AI Act guidelines), update the compliance checklist accordingly. When the client adds new LLM providers, configure additional connections in Settings.

---

## 10. Troubleshooting Common Issues

### "No data is showing on the dashboard"

This means the database has not been seeded with demo data, or no real LLM interactions have been ingested. Click the "Load Demo Data" button on the Dashboard page, or upload a log file on the Observability page.

### "The login page is not working"

Ensure the application has been published. The OAuth flow requires the application to be accessible at its public URL. Check that the domain configuration is correct in the Settings panel.

### "Uploaded log file shows no new interactions"

Verify the file format. Each line must be a valid JSON object with at minimum the fields: timestamp, model, prompt, and response. Check the browser console for any error messages.

### "Compliance scores are not updating"

After changing a requirement's status, the page should refresh automatically. If it does not, reload the page. The overall compliance score is calculated as the percentage of requirements with "compliant" status out of the total requirements for that framework.

### "Alerts are not being triggered"

Alerts are generated during the data seeding process. In production, alerts will be triggered automatically when the system detects conditions matching the configured alert rules (such as hallucination rate exceeding 15% or response timeout exceeding 30 seconds).

---

## 11. Security Checklist

Before delivering to a client, verify the following security measures are in place:

| Item | Status | How to Verify |
|------|--------|--------------|
| SSL/TLS encryption | Automatic | URL starts with https:// |
| Authentication required | Enabled | Unauthenticated users see landing page |
| API keys encrypted | Enabled | Keys stored as encrypted strings in database |
| Database access restricted | Enabled | Only accessible through the application |
| Session cookies secure | Enabled | HttpOnly, Secure, SameSite flags set |
| CORS policy configured | Enabled | Only allows requests from application domain |
| Input validation | Enabled | All API inputs validated with Zod schemas |
| SQL injection prevention | Enabled | Drizzle ORM uses parameterized queries |

---

## 12. Frequently Asked Questions

**Q: Can multiple clients use the same ZenThera instance?**
A: The current architecture supports a single tenant (one client per deployment). For multiple clients, you would deploy separate instances of ZenThera, each with its own database and domain.

**Q: How much data can ZenThera handle?**
A: The cloud-managed database can handle millions of interaction records. For very high-volume clients (more than 100,000 interactions per day), consider implementing data retention policies to archive older records.

**Q: Can I customize the compliance frameworks?**
A: Yes. The compliance requirements are stored in the database and can be modified through the Compliance Checklist interface. You can change descriptions, add XAI explanations, and adjust coverage percentages.

**Q: What happens if the LLM provider changes their API?**
A: The Shadow Proxy and SDK methods are designed to be provider-agnostic. They capture the raw request and response regardless of the specific API format. If a provider makes breaking changes, only the SDK configuration may need updating.

**Q: Is the data stored in compliance with GDPR?**
A: The application stores interaction data in a cloud-managed database with encryption at rest and in transit. For full GDPR compliance, ensure you have a data processing agreement with your client and implement data retention policies appropriate for their jurisdiction.

**Q: Can I add new compliance frameworks beyond the four included?**
A: Yes. You can add new frameworks and requirements through the database. Navigate to the Database panel in the Management UI, add a new record to the "compliance_frameworks" table, and then add individual requirements to the "compliance_requirements" table linked to the new framework.

**Q: How do I export compliance reports for auditors?**
A: Currently, compliance data can be viewed and filtered through the dashboard. For formal audit reports, you can use the browser's print function to generate PDFs of the Compliance Checklist page, or export the data through the Database panel.

---

## Appendix A: LLM Log File Format Reference

The log file upload feature accepts TXT and JSON files. Each line should contain a JSON object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| timestamp | string (ISO 8601) | Yes | When the interaction occurred |
| model | string | Yes | The LLM model name (e.g., "gpt-4o", "claude-3.5-sonnet") |
| prompt | string | Yes | The user's input prompt |
| response | string | Yes | The model's response |
| latencyMs | number | No | Response time in milliseconds |
| tokenCount | number | No | Total tokens used |
| userId | string | No | Identifier for the user who made the request |
| sessionId | string | No | Session identifier for grouping related interactions |
| metadata | object | No | Any additional key-value pairs |

**Example file content:**

```
{"timestamp":"2026-03-17T10:00:00Z","model":"gpt-4o","prompt":"What is our refund policy?","response":"Our refund policy allows returns within 30 days of purchase...","latencyMs":1200,"tokenCount":150}
{"timestamp":"2026-03-17T10:01:00Z","model":"gpt-4o","prompt":"Calculate compound interest on $50,000 at 5% for 10 years","response":"The compound interest would be $31,444.73...","latencyMs":800,"tokenCount":95}
```

---

## Appendix B: Test Results Summary

All automated tests passed successfully on March 17, 2026.

| Test Suite | Tests | Status | Duration |
|-----------|-------|--------|----------|
| Auth Logout | 1 | All Passed | 6ms |
| Dashboard Router | 2 | All Passed | 45ms |
| Observability Router | 3 | All Passed | 78ms |
| Behavior Router | 3 | All Passed | 65ms |
| Alerts Router | 3 | All Passed | 72ms |
| Compliance Router | 4 | All Passed | 134ms |
| **Total** | **16** | **All Passed** | **1.24s** |

---

## Appendix C: Feature Validation Checklist

Use this checklist when validating the application before client delivery:

| Feature | Page | What to Check | Expected Result |
|---------|------|--------------|----------------|
| Dashboard KPIs | / | Total Interactions, Anomalies %, Compliance %, Active Alerts | Numbers reflect database content |
| Dashboard Charts | / | Interaction Volume chart, Risk Distribution donut | Charts render with real data |
| Dashboard Activity | / | Recent Activity table | Shows latest events sorted by time |
| Observability Upload | /observability | Upload TXT/JSON log file | New interactions appear in table |
| Observability KPIs | /observability | Hallucination, Contradiction, Ambiguity, Timeout counts | Counts match filtered data |
| Observability Chart | /observability | Anomaly Detection Trend bar chart | Color-coded bars by anomaly type |
| Observability Table | /observability | Interaction Explorer with filters | Filter by type works correctly |
| Behavior Overview | /behavior | KPI cards and charts | Sessions, friction rate, abandonment rate shown |
| Behavior Heatmap | /behavior (tab) | Feature Heatmap grid | Color-coded usage intensity |
| Behavior Events | /behavior (tab) | Friction Events list | Events with type and description |
| Alerts KPIs | /behavior/alerts | Active, Investigating, Resolved, Total counts | Numbers match alert data |
| Alerts Actions | /behavior/alerts | Investigate, Resolve, Dismiss buttons | Status changes on click |
| Alerts Rules | /behavior/alerts | Rule configuration with toggles | Rules can be enabled/disabled |
| Compliance Scores | /compliance | Overall and per-framework percentages | Scores calculated from requirements |
| Compliance Checklist | /compliance (tab) | Requirements with XAI explanations | All 40 requirements displayed |
| Compliance Status | /compliance (tab) | Status dropdown on each requirement | Status updates on change |
| Ethics Events | /compliance (tab) | Ethics event list | Events with type and severity |
| Evidence Docs | /compliance (tab) | Evidence document list | Documents with upload dates |
| Settings LLM | /settings | Provider, model, API key form | Connection saves and shows in list |
| Settings Integration | /settings (tab) | SDK, Proxy, Webhook instructions | Integration guides displayed |
| Login Page | /login | Landing page for unauthenticated users | Professional landing with Sign In |
| Auth Flow | Sign In button | OAuth redirect and callback | User redirected to dashboard after login |

---

*This guide was prepared for ZenThera IO v1.0, a final production product. For questions or support, contact the ZenThera team.*
