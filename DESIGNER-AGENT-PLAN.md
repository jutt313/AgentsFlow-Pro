# Designer Agent - Complete Implementation Plan

## Overview
Build a fully functional Designer Agent powered by DeepSeek R1 v3 that acts as a business consultant, analyzing user requirements, designing optimal AI workforce solutions, and creating detailed blueprints for the Builder Agent.

---

## Agent Profile

### Role
User-facing business consultant and solution architect

### Core Mission
Transform plain English business descriptions into structured AI workforce blueprints through intelligent conversation, discovery, and design.

### Key Characteristics
- Conversational and friendly
- Business-focused (no technical jargon)
- Intelligent and proactive
- Comprehensive and thorough
- Visual and clear

---

## Complete Responsibilities & Scope

### 1. Natural Language Communication

#### Responsibilities
- Engage users in conversational dialogue
- Understand business requirements in plain English
- Ask intelligent follow-up questions
- Never reveal technical complexity
- Maintain professional yet friendly tone

#### Dynamic Capabilities
- Adapts conversation style based on user responses
- Handles ambiguous or incomplete information
- Provides examples when users are unclear
- Rephrases questions if user doesn't understand

#### Example Conversations
```
User: "I have an online store"
Agent: "Great! I'd love to help you build an AI team for your online store. 
        Let me understand your business better:
        
        1. What type of products do you sell?
        2. What e-commerce platform are you using? (Shopify, WooCommerce, etc.)
        3. What are your main challenges right now?"
```

---

### 2. Business Discovery & Analysis

#### Responsibilities
- Analyze business type and industry
- Auto-discover required business functions
- Identify automation opportunities
- Perform gap analysis
- Determine optimal team size

#### Dynamic Job Discovery System

**E-Commerce Store → Discovers:**
- Customer Support (ticket handling, returns, FAQs)
- Inventory Management (stock tracking, reordering)
- Marketing (campaigns, social media, email)
- Order Processing (fulfillment, tracking updates)
- Analytics (sales reports, customer insights)

**Social Media Agency → Discovers:**
- Content Creation (posts, captions, hashtags)
- Scheduling (optimal post times)
- Engagement (comment responses, DMs)
- Analytics (performance tracking)
- Client Reporting (automated reports)

**Customer Support Business → Discovers:**
- Ticket Management (routing, prioritization)
- Response Generation (AI-powered answers)
- Escalation Handling (when to involve humans)
- Knowledge Base Management (FAQ updates)
- Performance Monitoring (response times, satisfaction)

**SaaS Product → Discovers:**
- Onboarding (user setup, tutorials)
- Technical Support (bug reports, feature requests)
- User Engagement (usage analytics, retention)
- Billing Management (subscriptions, invoices)
- Feature Feedback Collection

#### Gap Analysis
- Identifies missing processes
- Suggests improvements
- Highlights inefficiencies
- Recommends optimizations

---

### 3. Solution Design

#### Responsibilities
- Design optimal team structure
- Decide single vs multi-agent approach
- Plan agent roles and responsibilities
- Design workflow and communication patterns
- Plan tool integrations

#### Decision Logic

**Single Agent** (Simple automation):
- One clear function
- No complex workflows
- Minimal integrations
- Example: "Send daily reports"

**Multi-Agent Team** (Complex automation):
- Multiple functions
- Requires coordination
- Multiple integrations
- Example: "Run entire e-commerce operations"

#### Manager Agent Decision
When multi-agent team is needed:
```
Agent: "Your automation will need 5 different agents working together.
        Would you like a Manager Agent to coordinate them? 
        
        The Manager Agent will:
        - Distribute tasks between agents
        - Monitor progress
        - Handle conflicts
        - Ensure smooth operations
        
        This is recommended for teams with 3+ agents."
```

#### Workflow Design Patterns

**Sequential Workflow:**
```
Agent A → Agent B → Agent C
Example: Order Processing → Inventory Check → Shipping
```

**Parallel Workflow:**
```
        ┌─ Agent A ─┐
Manager ├─ Agent B ─┤ → Output
        └─ Agent C ─┘
Example: Manager → [Marketing, Support, Analytics] → Reports
```

**Conditional Workflow:**
```
Agent A → Decision → Agent B (if condition)
                  → Agent C (else)
Example: Support Ticket → Classification → Human (complex)
                                         → AI Response (simple)
```

---

### 4. Credential Collection

#### Responsibilities
- Identify required integrations
- Request necessary credentials
- Validate credential formats
- Securely store credentials
- Explain why each credential is needed

#### Dynamic Credential Discovery

**E-Commerce Platform Integration:**
- Shopify: API Key, Store URL
- WooCommerce: Consumer Key, Consumer Secret, Site URL
- Magento: Access Token, Base URL

**Marketing Tools:**
- Google Ads: API Key, Customer ID, Developer Token
- Facebook Ads: Access Token, Ad Account ID
- TikTok Ads: Access Token, Advertiser ID
- Email (Mailchimp): API Key, List ID

**AI Services:**
- OpenAI: API Key, Organization ID
- Claude: API Key
- Custom Models: Endpoint URL, API Key

**Payment Processing:**
- Stripe: Secret Key, Publishable Key
- PayPal: Client ID, Secret

#### Credential Request Flow
```
Agent: "To connect with Shopify, I'll need:
        
        1. Shopify Store URL (e.g., yourstore.myshopify.com)
        2. Admin API Access Token
        
        This allows your AI team to:
        - Check inventory levels
        - Process orders
        - Update product information
        
        Don't worry - all credentials are encrypted and stored securely.
        
        Do you have these ready, or should I show you how to get them?"
```

---

### 5. Visual Design & Approval

#### Responsibilities
- Generate ReactFlow diagrams
- Show team structure visually
- Display agent connections
- Explain workflow flow
- Get user approval

#### Diagram Elements

**Manager Agent:**
```json
{
  "type": "manager",
  "icon": "👔",
  "color": "#3b82f6",
  "role": "Team Coordinator",
  "connections": ["all_agents"]
}
```

**Specialist Agents:**
```json
{
  "type": "specialist",
  "icon": "🎯",
  "color": "#10b981",
  "role": "Customer Support",
  "connections": ["manager", "integration_agents"]
}
```

**Integration Agents:**
```json
{
  "type": "integration",
  "icon": "🔌",
  "color": "#f59e0b",
  "role": "Shopify Connector",
  "connections": ["specialist_agents"]
}
```

#### Approval Process
```
Agent: "Here's your complete AI team structure:
        
        [SHOWS DIAGRAM]
        
        This team will handle:
        ✓ Customer support 24/7
        ✓ Inventory management
        ✓ Order processing
        ✓ Marketing campaigns
        ✓ Analytics & reporting
        
        Does this look good to you?
        
        You can ask me to:
        - Add more agents
        - Remove agents
        - Change responsibilities
        - Modify connections"
```

---

### 6. Blueprint Creation

#### Responsibilities
- Generate structured JSON blueprint
- Define all agents and roles
- Specify communication patterns
- Detail integration requirements
- Validate completeness
- Hand off to Builder Agent

#### Blueprint Schema

```json
{
  "blueprint_version": "1.0",
  "workflow_id": "uuid",
  "workflow_name": "E-commerce Automation",
  "created_at": "timestamp",
  "user_id": "uuid",
  
  "business_context": {
    "industry": "E-commerce",
    "business_type": "Online Clothing Store",
    "platform": "Shopify",
    "scale": "Medium (100-500 orders/day)",
    "primary_goals": [
      "Reduce customer support response time",
      "Automate inventory management",
      "Improve marketing ROI"
    ]
  },
  
  "team_structure": {
    "has_manager": true,
    "total_agents": 6,
    "agent_count_by_type": {
      "manager": 1,
      "specialist": 4,
      "integration": 1
    }
  },
  
  "agents": [
    {
      "agent_id": "manager-001",
      "agent_type": "Manager",
      "name": "Operations Manager",
      "role": "Team Coordinator",
      "responsibilities": [
        "Task distribution and prioritization",
        "Monitor team performance",
        "Handle escalations",
        "Generate daily reports"
      ],
      "tools": [
        "task_scheduler",
        "team_monitor",
        "report_generator"
      ],
      "decision_authority": "high",
      "can_modify_workflow": true,
      "reports_to": "user",
      "manages": [
        "specialist-001",
        "specialist-002",
        "specialist-003",
        "specialist-004"
      ]
    },
    {
      "agent_id": "specialist-001",
      "agent_type": "Specialist",
      "name": "Customer Support Agent",
      "role": "Customer Service Representative",
      "responsibilities": [
        "Answer customer inquiries",
        "Handle returns and refunds",
        "Manage support tickets",
        "Escalate complex issues"
      ],
      "tools": [
        "email_client",
        "knowledge_base",
        "ticket_system",
        "sentiment_analyzer"
      ],
      "decision_authority": "medium",
      "can_modify_workflow": false,
      "reports_to": "manager-001",
      "collaborates_with": ["specialist-002", "integration-001"]
    },
    {
      "agent_id": "specialist-002",
      "agent_type": "Specialist",
      "name": "Inventory Manager",
      "role": "Stock Management Specialist",
      "responsibilities": [
        "Monitor stock levels",
        "Trigger reorder alerts",
        "Forecast demand",
        "Optimize inventory"
      ],
      "tools": [
        "inventory_tracker",
        "demand_forecaster",
        "reorder_calculator",
        "supplier_connector"
      ],
      "decision_authority": "medium",
      "can_modify_workflow": false,
      "reports_to": "manager-001",
      "collaborates_with": ["integration-001"]
    }
  ],
  
  "integrations": [
    {
      "integration_id": "int-001",
      "service": "Shopify",
      "purpose": "E-commerce platform connection",
      "required_credentials": [
        "shopify_api_key",
        "shopify_store_url",
        "shopify_access_token"
      ],
      "endpoints_used": [
        "/admin/api/products",
        "/admin/api/orders",
        "/admin/api/inventory"
      ],
      "used_by_agents": [
        "specialist-002",
        "specialist-001",
        "integration-001"
      ]
    }
  ],
  
  "communication_patterns": [
    {
      "pattern_type": "request_response",
      "from": "manager-001",
      "to": "specialist-001",
      "trigger": "new_customer_inquiry",
      "flow": "Manager receives inquiry → Routes to Support Agent → Support responds → Manager reviews → Sends to customer"
    },
    {
      "pattern_type": "event_driven",
      "trigger": "inventory_low",
      "from": "specialist-002",
      "to": "manager-001",
      "flow": "Inventory check → Low stock detected → Alert Manager → Manager approves reorder"
    }
  ],
  
  "workflow_rules": [
    {
      "rule_id": "rule-001",
      "condition": "customer_inquiry_sentiment == 'angry'",
      "action": "escalate_to_manager",
      "priority": "high"
    },
    {
      "rule_id": "rule-002",
      "condition": "inventory_level < reorder_point",
      "action": "trigger_reorder_alert",
      "priority": "medium"
    }
  ],
  
  "monitoring_config": {
    "health_check_interval": "30s",
    "performance_metrics": [
      "response_time",
      "success_rate",
      "task_completion_rate",
      "error_rate"
    ],
    "alert_thresholds": {
      "response_time_ms": 5000,
      "error_rate_percent": 5,
      "success_rate_percent": 95
    }
  },
  
  "credentials": {
    "shopify_api_key": "encrypted_value",
    "shopify_store_url": "encrypted_value",
    "openai_api_key": "encrypted_value"
  },
  
  "reactflow_diagram": {
    "nodes": [...],
    "edges": [...]
  },
  
  "status": "ready_for_build",
  "approved_by_user": true,
  "approval_timestamp": "timestamp"
}
```

---

## Technical Implementation

### Architecture Components

#### 1. DeepSeek Integration (`lib/deepseek.ts`)
```typescript
- createChatCompletion(messages, systemPrompt)
- streamChatCompletion(messages, systemPrompt)
- analyzeBusinessRequirements(userInput)
- generateFollowUpQuestions(context)
```

#### 2. Designer Agent Core (`lib/designer-agent.ts`)
```typescript
- ConversationManager
  - initializeConversation()
  - processUserMessage()
  - generateResponse()
  - trackConversationState()

- BusinessAnalyzer
  - identifyBusinessType()
  - discoverRequiredFunctions()
  - performGapAnalysis()
  - determineTeamSize()

- TeamDesigner
  - designTeamStructure()
  - defineAgentRoles()
  - planWorkflow()
  - createCommunicationPatterns()

- CredentialCollector
  - identifyRequiredIntegrations()
  - requestCredentials()
  - validateCredentials()
  - securelyStoreCredentials()
```

#### 3. Blueprint Generator (`lib/blueprint-generator.ts`)
```typescript
- generateBlueprint(conversationData, teamDesign, credentials)
- validateBlueprint(blueprint)
- generateReactFlowDiagram(blueprint)
- convertToBuilderFormat(blueprint)
```

#### 4. API Endpoints
```
POST /api/agents/designer/chat
  - Initialize or continue conversation
  - Process user messages
  - Return agent responses

POST /api/agents/designer/blueprint
  - Generate final blueprint
  - Validate completeness
  - Store in database

GET /api/agents/designer/session/:sessionId
  - Retrieve conversation state
  - Get current progress

POST /api/agents/designer/credentials
  - Store credentials securely
  - Validate credential formats
```

#### 5. Database Models
```prisma
model DesignerSession {
  id            String   @id @default(uuid())
  userId        String
  conversationState Json
  businessContext Json
  teamDesign    Json?
  blueprint     Json?
  status        String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

## System Prompts

### Main System Prompt
```
You are the Designer Agent for AgentFlow PRO, an expert business consultant and solution architect 
specializing in AI workforce design.

YOUR ROLE:
- Help users design optimal AI agent teams for their business automation needs
- Understand business requirements through natural conversation
- Design comprehensive AI workforce solutions
- Create detailed blueprints for implementation

YOUR PERSONALITY:
- Professional yet friendly and approachable
- Patient and thorough
- Proactive in asking clarifying questions
- Clear and concise in communication
- Never use technical jargon with users

YOUR PROCESS:
1. Understand the user's business and needs
2. Discover required business functions automatically
3. Design optimal team structure
4. Collect necessary credentials
5. Create visual diagrams for approval
6. Generate detailed blueprint

IMPORTANT RULES:
- Always ask clarifying questions when requirements are unclear
- Explain WHY you're asking each question
- Provide examples to help users understand
- Never expose technical complexity
- Get user approval before finalizing blueprint
- Be proactive about potential challenges or limitations
```

### Business Analysis Prompt
```
Analyze the following business description and identify:
1. Industry and business type
2. All required business functions
3. Potential automation opportunities
4. Required integrations
5. Recommended team structure

Business Description: {user_input}

Provide structured analysis in JSON format.
```

### Credential Collection Prompt
```
Based on the following integrations required:
{integrations_list}

Generate a friendly message to request credentials that:
1. Lists each integration and why it's needed
2. Specifies exact credentials required
3. Provides guidance on where to find them
4. Reassures about security
5. Offers help if user doesn't have them yet
```

---

## Implementation Phases

### Phase 1: Core Infrastructure
- DeepSeek API integration
- Conversation state management
- Database models
- Basic API endpoints

### Phase 2: Business Intelligence
- Business type identification
- Function discovery system
- Gap analysis engine
- Team structure designer

### Phase 3: Blueprint Generation
- Blueprint schema implementation
- Validation system
- ReactFlow diagram generator
- Builder Agent handoff

### Phase 4: Advanced Features
- Credential collection system
- Iterative refinement
- Multi-language support
- Analytics and learning

---

## Success Metrics

### Performance Metrics
- Response time < 2 seconds
- >90% accurate function discovery
- >95% user approval rate
- <5% blueprint rejections by Builder

### Quality Metrics
- Conversation completion rate
- User satisfaction score
- Blueprint quality score
- Time to complete design

---

This plan provides complete specifications for building a fully functional, dynamic Designer Agent that can handle any business automation requirement.

