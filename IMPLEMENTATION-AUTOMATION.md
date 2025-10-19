# Automation Mode — Implementation Guide (Developer Hand‑Off)

This guide specifies exactly what to build for Automation Mode in AgentFlow PRO. Follow the steps, create the files, and meet the acceptance checks. Keep changes minimal and scoped to Automation.

---

## Outcomes (Definition of Done)
- Designer (Automation mode) captures a goal, drafts a diagram immediately, iterates with targeted Q&A, determines and collects exact credentials, then outputs a production‑ready blueprint tagged `type="Automation"`.
- Secure credential storage (AES‑256‑GCM) with per‑tool specs and scopes.
- Webhook trigger system (URL + secret + HMAC) with verify/test endpoints.
- Blueprint includes: steps, triggers, mappings, AI steps, retries/backoff, fallbacks, logging/metrics, testing plan, and ReactFlow diagram.
- UI shows live diagram, recommendations, credential field specs, and webhook setup info.

---

## Phase 1 — System Prompt & Conversation Flow

1. Replace Designer system prompt (Automation‑only)
   - File: `lib/designer-agent.ts`
   - Replace `DESIGNER_SYSTEM_PROMPT` with the Automation prompt (from our latest spec). Remove AI Workforce references. Emphasize:
     - Step‑based flow (trigger → actions/conditions → outputs)
     - No manager/team coordination
     - Generate initial diagram immediately; ask 1–2 targeted questions at a time

2. Update conversation stages
   - File: `lib/designer-agent.ts`
   - Replace enum with:
     - `INITIAL` — greet + ask goal
     - `DIAGRAM_DRAFT` — generate initial diagram from goal
     - `CLARIFICATION` — targeted Q&A (tools, LLM, triggers)
     - `RECOMMENDATIONS` — propose AI agent steps/retries/alerts
     - `CREDENTIALS` — collect exact credentials per integration
     - `APPROVAL` — show final diagram + summary
     - `COMPLETE` — deliver blueprint (type="Automation")

3. Implement diagram‑first flow
   - File: `lib/designer-agent.ts` (`handleInitialStage` and new handlers)
   - Parse user goal → extract trigger, actions, decision points, AI‑worthy steps → generate initial diagram and store in state → ask first clarification question.

Acceptance checks
- First user message after selecting Automation produces a left→right diagram and 1 clarification question.
- No long questionnaire; at most 1–2 questions per turn.

---

## Phase 2 — Smart Recommendations

1. Recommendation engine
   - File (new): `lib/automation-recommendations.ts`
   - Export `analyzeStepsForRecommendations(steps) => StepRecommendation[]` with types:
     - `type: 'ai-agent' | 'retry' | 'alert' | 'fallback'`
   - Heuristics:
     - Suggest AI summarizer after fetch/email steps
     - Suggest AI classifier for routing decisions
     - Suggest retries/backoff on API steps
     - Suggest Slack alerts on error branches
     - Suggest AI enrichment for company/contact data

2. Integrate into Designer
   - File: `lib/designer-agent.ts`
   - Add `handleRecommendationsStage()` that presents top 2–3 suggestions with Yes/No; apply to diagram/state.

Acceptance checks
- After clarifications, user sees 2–3 suggestions; accepting updates the diagram immediately.

---

## Phase 3 — Credential Registry & Secure Storage

1. Credential Registry
   - File (new): `lib/credential-registry.ts`
   - Export `CREDENTIAL_REGISTRY: Record<string, CredentialSpec>` where:
     - `fields: { name; type; label; required }[]`
     - `scopes: string[]`, `authType: 'oauth' | 'api-key' | 'basic'`, `docsUrl?: string`
   - Include: Gmail, SendGrid, Shopify, Slack, Stripe, Notion, Airtable, HubSpot, Salesforce.

2. Drive credential collection
   - File: `lib/designer-agent.ts` (`handleCredentialsStage`)
   - Use registry to render exact fields/scopes; bind credential usage to specific steps (least privilege).
   - If platform unknown → do online research (use existing `deepseek` helper or placeholder) and cache result in session.

3. Fix encryption (AES‑256‑GCM)
   - File: `app/api/agents/designer/credentials/route.ts`
   - Replace deprecated `createCipher/createDecipher` with `createCipheriv/createDecipheriv` + IV + authTag.

4. Extend Credential model
   - File: `prisma/schema.prisma`
   - Add fields to `Credential`:
     - `metadata Json?` (issuer, notes)
     - `scopes String[] @default([])`
     - `boundToSteps String[] @default([])`
   - Run migration.

Acceptance checks
- Credentials encrypt/decrypt correctly; fail on tamper.
- Collected credentials show field names and scopes per tool.
- Credential metadata stored and steps are bound.

---

## Phase 4 — Webhook Trigger System

1. DB models
   - File: `prisma/schema.prisma`
   - Add:
```
model WebhookTrigger {
  id             String   @id @default(cuid())
  workflowId     String
  url            String   @unique
  secretHash     String
  verifiedAt     DateTime?
  lastSample     Json?
  expectedSchema Json?
  createdAt      DateTime @default(now())
  workflow       AIWorkflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
}

model WebhookEvent {
  id         String   @id @default(cuid())
  triggerId  String
  payload    Json
  signature  String
  timestamp  DateTime
  verified   Boolean
  processed  Boolean  @default(false)
  createdAt  DateTime @default(now())
}
```

2. Signature utils
   - File (new): `lib/webhook-signature.ts`
   - `generateSignature(secret, timestamp, body)` + `verifySignature(signature, secret, timestamp, body)` (HMAC‑SHA256 over `timestamp + rawBody`).

3. API endpoints
   - Files (new):
     - `app/api/triggers/webhook/create/route.ts` — returns `{url, secret, headers, setupInstructions}`
     - `app/api/triggers/webhook/verify/route.ts` — stores sample payload and marks `verifiedAt`
     - `app/api/triggers/test/route.ts` — replays last sample (simulation)
     - `app/api/webhooks/trigger/[triggerId]/route.ts` — receives events; verifies signature; stores event; idempotent

4. Designer integration
   - File: `lib/designer-agent.ts`
   - When trigger is event‑based, create webhook during approval and include details in blueprint + diagram trigger node.

Acceptance checks
- Create returns URL/secret; verify accepts a sample and marks verified; receiver validates signatures and stores events.

---

## Phase 5 — Blueprint Generation (Automation)

1. Add blueprint type and structure
   - File: `lib/blueprint-generator.ts`
   - Add `type: 'Automation'` to the exported blueprint structure and a `generateAutomationBlueprint()` entry point.
   - Include:
     - `steps: AutomationStep[]`
     - `triggers: { type, webhook?, schedule?, polling? }`
     - `mappings`, `ai_steps`, `resilience` (retries/backoff/fallbacks/timeouts)
     - `logging`, `testing`, `reactflow_diagram`

2. Diagram enhancements
   - File: `lib/blueprint-generator.ts` (`generateAutomationDiagram`)
   - Left→right layout, step numbers on labels, AI badge/color, decision labels on edges.

Acceptance checks
- Blueprint JSON validates against the new structure and includes `type: 'Automation'`.
- Diagram visually distinguishes AI steps and shows step/order clearly.

---

## Phase 6 — UI Updates

1. DesignerChat
   - File: `app/components/DesignerChat.tsx`
   - Default to Automation (hide AI Workforce in this mode).
   - Show diagram right after goal capture.
   - Render recommendations (add `RecommendationPills` component).
   - Credential form shows field‑level details and scopes.
   - Show webhook setup instructions after trigger creation.

2. WorkflowDiagram
   - File: `app/components/WorkflowDiagram.tsx`
   - Add step numbering, AI badges (🤖 + purple), edge condition labels, smoother live updates.

3. RecommendationPills
   - File (new): `app/components/RecommendationPills.tsx`
   - Simple pill buttons with title + rationale and Accept/Decline handlers.

Acceptance checks
- Diagram appears after first answer.
- Accepting a recommendation updates the diagram instantly.
- Credential UI shows exact fields/scopes.
- Webhook instructions visible when applicable.

---

## Phase 7 — Tests

1. Unit tests
   - Files (new): `__tests__/automation-mode.test.ts`
   - AES‑GCM encrypt/decrypt success & tamper detection
   - Webhook signature gen/verify
   - Recommendation heuristics on sample steps
   - Diagram generator layout sanity

2. Integration tests
   - Files (new): `__tests__/automation-flow.test.ts`
   - Goal → diagram → credentials → blueprint (happy path)
   - Webhook create/verify/test roundtrip

Acceptance checks
- All tests pass locally; core paths covered.

---

## Phase 8 — Documentation

1. Expand `automation.md`
   - Add API examples for webhook create/verify/test and receiver.
   - Add platform credential field specs and scopes.

2. Setup guides
   - Files (new):
     - `docs/webhook-setup-guide.md` — per‑platform webhook instructions
     - `docs/credential-setup-guide.md` — OAuth/API key setup, scopes, tips

Acceptance checks
- Docs provide copy‑paste examples and clear setup steps.

---

## Migration & Config
- Prisma migrations for new fields/tables; run `npm run prisma:migrate`.
- Ensure `CREDENTIAL_ENCRYPTION_KEY` is a 32‑byte key.
- Guard DeepSeek: `lib/deepseek.ts` must not throw if `DEEPSEEK_API_KEY` is missing (lazy init + fallback).

---

## Quick Task Checklist
- [ ] Update `DESIGNER_SYSTEM_PROMPT` (Automation‑only)
- [ ] Add stages + diagram‑first flow
- [ ] Implement recommendations engine + UI
- [ ] Create credential registry + drive collection
- [ ] AES‑256‑GCM crypto + Credential model fields
- [ ] Webhook models + signature + APIs + receiver
- [ ] Blueprint: `type: 'Automation'` + steps/triggers/mappings/resilience
- [ ] Diagram enhancements
- [ ] Tests (crypto, signatures, recommendations, flow)
- [ ] Docs (automation.md + guides)

---

## Acceptance Demo Script (5 minutes)
1) Select Automation, state goal → show initial diagram.
2) Answer 2 clarifications → diagram updates.
3) Accept 1 recommendation (AI summarizer) → diagram updates.
4) Choose Gmail + Slack → credential fields/scopes shown → submit sample creds (dev env).
5) Create webhook trigger → copy URL/secret → send test → verify success.
6) Finalize → show blueprint JSON with `type: 'Automation'` and all sections.

Keep changes scoped; don’t break existing AI Workforce files. Ask before modifying unrelated modules.

