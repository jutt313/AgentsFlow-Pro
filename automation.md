# Automation Overview

Automation is a step‑based workflow where business processes run automatically through triggers, actions, and conditions (similar to Make.com, Zapier, n8n). It can have any number of steps (even 1000+). AI agents are attached only to steps that require intelligence; there is no internal team coordination or a manager. Data flows linearly or with branches, and each AI agent focuses strictly on its designated step(s).

## Key Properties
- Scope: Any number of steps; few AI agents can cover specific steps.
- Structure: Trigger ➜ actions/conditions ➜ outputs (left‑to‑right flow).
- Coordination: None between agents; no manager; no team conversation.
- Execution: Deterministic flow with conditional branches, retries, and fallbacks.
- Integrations: Connects to apps/APIs, files, and web; credentials stored securely.

## Intake & Discovery (Designer Automation Mode)
- Goal Capture: “What do you want to automate?” → generate an initial diagram immediately from the user’s description.
- Targeted Clarifications: ask only what’s unclear, one at a time (e.g., “Which email provider?” “Which LLM?”).
- Agent Recommendations: propose agent‑worthy steps (summarization, enrichment, classification, content gen) with 1‑click add.
- Live Diagram Updates: any answer/change updates the left→right diagram in real time.

## Example (E‑commerce Order Flow)
- Step 1: Trigger — New Shopify order created.
- Step 2: Validate order and check inventory (standard step).
- Step 3: AI Agent — Generate personalized order confirmation email summary; send via SendGrid.
- Step 4: Lookup CRM; enrich customer profile (standard step).
- Step 5: AI Agent — Draft “delay notice” copy when shipping ETA > threshold.
- Steps 6–10: Create shipment (Shippo), update Shopify with tracking, notify Slack, log metrics.

Notes:
- Only selected steps (e.g., 3 and 5) use AI agents.
- The same agent can serve multiple steps, but there’s no cross‑step team planning.

---

# Agents in Automation

In Automation, agents are step‑scoped executors. They can be powerful at their step (reasoning, memory, tool use) but do not coordinate with other agents.

## Core Intelligence
- Reasoning: Decide how to complete the current step (not orchestrate the whole flow).
- Memory: Recall past runs, preferences, and context relevant to this step.
- Learning: Improve prompts/handlers from feedback and performance metrics.
- Self‑debugging: Detect and fix common step‑level errors (e.g., malformed payload, missing field).

## External Power
- Web Search & Scrape: Gather live info to complete the step.
- API Access: Call public/private APIs dynamically; handle auth and pagination.
- File Understanding: Read/write docs, CSVs, PDFs; transform/validate content.
- Multi‑App Control: Operate multiple tools in the same step (e.g., Slack + Notion + Gmail).

## Autonomy & Action
- Goal Mode: Given a step goal, plan sub‑actions to achieve it.
- Task Chaining: Execute mini multi‑step subplans within the single step boundary.
- Conditional Logic: If X fails → try Y; apply fallbacks and retries.
- Scheduling & Triggers: Respect upstream triggers and schedule rules defined by the workflow.

## Interaction
- Natural Language I/O: Explain outputs, ask clarifying questions (user‑visible when needed).
- Explain Decisions: Provide rationale for choices within the step.
- Collaborate with Other Agents: Delegate a subtask by invoking another agent’s capability (no standing team conversations).

## Safety & Control
- Permission Boundaries: Only act within approved scopes (APIs, files, data regions).
- Activity Log: Record actions, inputs, outputs, and reasoning summaries.
- Sandbox Testing: Simulate a step with sample data before live execution.

## Credential Mapping (Per Tool)
- Define exact fields required per integration (e.g., Gmail OAuth, SendGrid API Key, Shopify Access Token).
- Scopes: least‑privilege per workflow; rotation and revocation supported.
- Storage: encrypted at rest with AES‑GCM; access restricted by workflow and step.

## Bonus Capabilities
- Emotion/Tone Awareness: Tailor generated content to tone/persona.
- Long‑Term Relationship Memory: Remember users/brands across months for consistent outputs.
- Self‑Evolution: Suggest new step automations or optimizations.
- Offline Reasoning Cache: Operate with cached knowledge for short periods when network is unavailable.

---

# Designer vs. Builder (Automation Context)

- Designer Agent (Automation mode):
  - Asks clarifying questions to understand the business and the end‑to‑end flow.
  - Identifies which specific steps need AI agents vs. standard actions.
  - Collects required credentials and produces a left‑to‑right diagram (trigger → actions/conditions → outputs) with agent badges only on AI steps.
  - Prepares a detailed blueprint after user approval.

- Builder Agent (Automation mode):
  - Translates the design into a runnable workflow: connectors, auth, mappings.
  - Applies retries, fallbacks, and monitoring; adds logs and metrics.
  - Runs sandbox tests; then deploys to production with activity logs and guardrails.
  - Generates webhooks and trigger endpoints; validates signatures; manages schedules.

---

# Automation Builder System (High Level)

The Builder turns the approved Automation design into a production‑ready flow with webhooks, schedules, mappings, and execution guarantees.

## Triggers
- Webhooks: per‑workflow, per‑trigger URL with secret, timestamp, and HMAC‑SHA256 signature.
  - Example Headers: `X-AF-Signature`, `X-AF-Timestamp`, `X-AF-Workflow`.
  - Validation: `signature = HMAC_SHA256(secret, timestamp + body)`; reject if clock skew > tolerance.
- Polling: interval‑based fetch with deduplication via idempotency key.
- Schedules: cron or human‑friendly schedules (daily, weekly, custom windows).

## Webhook Registration Flow
1) Designer finalizes trigger definition (source app, event type, expected payload schema).
2) Builder issues: webhook URL, shared secret, scope list, setup instructions/snippet for the source app.
3) User pastes URL/secret into source system; sends a test event.
4) Builder validates signature and schema; stores sample payload; marks trigger “verified”.

## Mappings & Transformations
- Field Mapper: JSONPath/expressions, type coercion, default values, and validation rules.
- Templates: prebuilt mappings for common apps (Shopify, Slack, Notion, Gmail, Stripe, etc.).
- Redaction: strip secrets/PII from logs; mask sensitive fields.

## Step Execution Model
- Engine: queue‑backed, idempotent handlers per step; correlation IDs per run.
- Retries/Backoff: immediate, linear, or exponential based on step policy.
- Fallbacks: alternate provider or branch on failure (e.g., send alert to Slack).
- Timeouts: per‑step hard caps with cancel/abort and cleanup.

## Credentials & Scopes
- Per‑integration credentials bound to workflow; least‑privilege scopes.
- Rotation & Revocation: replace secrets without downtime; revoke on incident.
- Access Control: only designated steps can use given credentials.

## Testing & Simulation
- Test Trigger: replay captured sample payloads.
- Step Sandbox: dry‑run a step with diff preview of side effects.
- Chaos Tests: simulate failures/timeouts to validate fallbacks.

## Observability
- Runs: per‑run timeline, per‑step logs, input/output snapshots.
- Metrics: success rate, avg latency, error reasons, retries, throughput.
- Alerts: thresholds for error rate/latency; integration‑specific health.

## Versioning & Releases
- Draft vs Published: edit in draft; promote after passing tests.
- Version History: diffs and rollback to prior versions.

## Security
- Encryption: AES‑GCM for secrets at rest; TLS in transit.
- Signatures: HMAC for inbound webhooks; signed outbound calls when supported.
- Least Privilege: narrow scopes by integration and step.

---

# Design Guidelines for Automation Diagrams
- Layout: Left‑to‑right; clear sequential flow with optional branches.
- Node Types: trigger, condition, action, ai‑agent, filter, search, loop, validation, notification, data‑transform, integration/api, error‑handler, delay/wait, success/end.
- Visuals: Professional, clean; industry‑appropriate colors; labels indicate step purpose and criteria.
- Connections: Animated arrows showing data flow direction; edge labels for conditions.

---

# Security & Credentials
- Credentials stored encrypted at rest; access restricted per workflow and platform.
- Least‑privilege scopes; rotation and revocation supported.
- All agent actions logged with timestamps and context.
 - Webhooks signed with HMAC; timestamps checked; replay protection via nonce/idempotency keys.

---

# Summary
Automation is a high‑scale, step‑based flow where AI agents are attached only to the steps that need intelligence. There is no manager or team coordination; agents are powerful within their steps, leveraging reasoning, memory, tools, and safeguards. The Designer captures requirements and creates the plan; the Builder implements, tests, and deploys the automation reliably.
