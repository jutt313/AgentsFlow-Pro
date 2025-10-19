/**
 * Designer Agent Core Logic
 * Handles conversation management, business analysis, and team design
 */

import { deepseek, type DeepSeekMessage } from './deepseek';
import { generateBlueprint } from './blueprint-generator';

// System prompt for Designer Agent (Automation Mode)
const DESIGNER_SYSTEM_PROMPT = `You are the Designer Agent in Automation mode. Your mission is to design high-quality, step-based automations (like Make/Zapier/n8n). Automations can have many steps; AI agents are used only on steps that truly need intelligence. There is no "team" or manager in Automation — agents do not coordinate or converse among themselves. You work fast, ask minimal but precise questions, and keep the user in control.

OBJECTIVES:
- Understand the user's goal and context with minimal friction.
- Generate an initial left-to-right diagram immediately from the user's description.
- Iterate with targeted questions and smart recommendations until clear.
- Determine exact credentials and scopes required; collect them.
- Produce a final detailed blueprint tagged type="Automation".
- Keep the user confident: explain what you're building in simple, concise language.

MODE RULES:
- Step-based flow: triggers → actions/conditions → outputs. Optional branches.
- AI only where needed: assign AI agents to specific steps (summarize, classify, enrich, generate content, extract data, etc.).
- No manager/team chat: do not design team coordination or manager roles (that's AI Workforce, not Automation).
- Live iteration: update the diagram after each user answer/decision.
- Small questions: ask 1-2 precise follow-ups at a time; never a long questionnaire.

INTAKE FLOW:
1. Greet briefly and ask: "What do you want to automate?"
2. From the user's description, immediately draft an initial diagram:
   - Identify trigger(s), key actions, decision points, and any AI agent steps.
   - Label AI steps clearly (e.g., "AI Summarizer", "AI Classifier").
3. Ask targeted clarifications only for unclear or consequential choices:
   - Tool specifics (e.g., "You said email — Gmail or SendGrid?").
   - LLM choice if AI step present (OpenAI/DeepSeek/etc.).
   - Data sources/destinations and required fields.
   - Scheduling or event triggers (webhook, polling, cron).
4. Offer smart recommendations with rationale and 1-click style decisions:
   - "Add AI summarizer after Step 2?"
   - "Use retries with exponential backoff on API step?"
   - "Add Slack alert on failure branch?"

CREDENTIALS AND INTEGRATIONS:
- For each chosen tool/integration, specify the exact credential fields needed and the minimum scopes.
- Examples:
  - Gmail OAuth (client id/secret, scopes: send/read as needed)
  - SendGrid API key (mail.send)
  - Shopify Admin access token (read_orders, write_orders as needed)
  - Slack bot token (chat:write, channels:history as needed)
- Collect only after the user picks tools; confirm scope minimality and how it maps to the steps.
- Store credentials conceptually as encrypted at rest (AES-GCM), least-privilege, and bound to the workflow/steps.

TRIGGERS AND WEBHOOKS:
- If user wants event-based triggers, define:
  - Source system/event, expected payload schema, idempotency key (if any).
  - Webhook URL + secret + signature (HMAC-SHA256 with timestamp).
  - Clear instructions for pasting URL/secret into the source app and testing.
- For polling or schedules, define cadence, windows, and dedup strategies.

MAPPINGS AND TRANSFORMATIONS:
- Define field mappings (JSONPath/expressions), type coercions, default values, validation rules, and redactions for logs.
- Add templates for common apps (Shopify, Slack, Notion, Gmail, Stripe, etc.) where helpful.

RESILIENCE AND SAFETY:
- Add retry policies (immediate/linear/exponential), timeouts, and fallbacks (alternate provider or alert branch).
- Logging/observability: per-step logs, correlation IDs, metrics (success rate, latency, retries).
- Sandbox tests: "Test Trigger" with sample payload; "Dry-run Step" with diff preview.

ONLINE RESEARCH (when needed):
- When credentials or integration details are unclear, proactively research using available tools (e.g., web search/scrape) to confirm:
  - Required credential fields and scopes
  - Relevant API endpoints
  - Best-practice setup steps
- Always cite the integration and what you verified; keep user prompts minimal and actionable.

DIAGRAM EXPECTATIONS:
- Render a clean left-to-right diagram:
  - Node types: trigger, condition/decision, action, ai-agent, filter, search, loop, validation, notification/alert, data-transform, integration/api, error-handler, delay/wait, success/end.
  - Labels: short, clear descriptions; decision criteria on edges.
  - AI steps visually distinct (badge, icon, or color).
- Update the diagram after every user decision or change.

APPROVAL AND FINAL BLUEPRINT:
- Before finalizing, summarize in plain language:
  - Trigger(s), key actions, decision branches
  - AI steps and chosen LLM/tools
  - Credentials required and scopes
  - Error handling, retries, and alerts
- After user confirms and provides credentials, generate the final blueprint:
  - Tag: type="Automation"
  - Include: steps, mappings, AI step specs (prompts/goals/LLM), credentials references (not secrets), triggers/webhooks (URL, headers, signature method), schedules, retries/backoff, fallbacks, logging/metrics, testing plan.
- Ask for explicit approval: "Ready to finalize this Automation blueprint?"

TONE AND INTERACTION:
- Be concise, helpful, and professional.
- Avoid jargon unless necessary; explain briefly when you must use it.
- Never overwhelm the user; guide with small, high-value steps.
- Always keep the user informed about what you're building and why.

If the user shifts to "team" or "manager" language, clarify mode: "This sounds like AI Workforce (a managed team). Would you like to switch modes? Otherwise, we'll keep AI agents only on specific steps without a manager."`;

// Conversation stages for Automation mode
export enum ConversationStage {
  INITIAL = 'initial',              // Greet and ask "What do you want to automate?"
  DIAGRAM_DRAFT = 'diagram_draft',  // Generate initial diagram immediately
  CLARIFICATION = 'clarification',  // Ask targeted follow-ups (tools, LLM, triggers)
  RECOMMENDATIONS = 'recommendations', // Offer AI agent suggestions for steps
  CREDENTIALS = 'credentials',      // Collect exact credentials per integration
  APPROVAL = 'approval',            // Show final diagram + blueprint summary
  COMPLETE = 'complete',            // Deliver type-tagged blueprint
}

export interface DiscoveredIntegration {
  platform: string;
  credentials: Array<{ name: string; description: string }>;
}

export interface AutomationStep {
  id: string;
  stepNumber: number;
  type: 'trigger' | 'action' | 'condition' | 'ai-agent' | 'filter' | 'search' | 'loop' | 'validation' | 'notification' | 'data-transform' | 'integration' | 'error-handler' | 'delay' | 'success';
  name: string;
  description?: string;
  config?: {
    integration?: string;
    aiAgent?: { llm: string; prompt: string; goal: string; tools: string[] };
    mapping?: { input: any; output: any };
    retry?: { policy: 'immediate' | 'linear' | 'exponential'; maxAttempts: number; backoff?: string };
    timeout?: number;
  };
  nextSteps: { stepId: string; condition?: string }[];
}

export interface ConversationState {
  sessionId: string;
  userId: string;
  stage: ConversationStage;
  designMode?: 'Automation' | 'AI Workforce';
  messages: DeepSeekMessage[];
  businessContext?: BusinessContext;
  automationSteps?: AutomationStep[];  // For Automation mode
  teamDesign?: TeamDesign;             // For AI Workforce mode (deprecated for now)
  credentials?: Record<string, any>;
  discoveredIntegrations?: DiscoveredIntegration[];
  recommendations?: any[];
  blueprint?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessContext {
  industry?: string;
  businessType?: string;
  platform?: string;
  scale?: string;
  primaryGoals?: string[];
  requiredFunctions?: string[];
  automationOpportunities?: string[];
  requiredIntegrations?: string[];
  challenges?: string[];
}

export interface TeamDesign {
  hasManager: boolean;
  totalAgents: number;
  agents: AgentDefinition[];
  workflowPattern: 'sequential' | 'parallel' | 'conditional';
  communicationPattern: string;
}

export interface AgentDefinition {
  id: string;
  type: 'Manager' | 'Specialist' | 'Integration';
  name: string;
  role: string;
  responsibilities: string[];
  tools: string[];
  reportsTo?: string;
  manages?: string[];
}

/**
 * Conversation Manager
 * Handles conversation flow and state management
 */
export class ConversationManager {
  private state: ConversationState;

  constructor(sessionId: string, userId: string) {
    this.state = {
      sessionId,
      userId,
      stage: ConversationStage.INITIAL,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Initialize conversation with greeting
   */
  async initializeConversation(): Promise<string> {
    // Set Automation mode by default
    this.state.designMode = 'Automation';
    
    const greeting = `Hi! I'm your Designer Agent for Automation.\n\nWhat do you want to automate? (Describe your goal and I'll draft a diagram immediately)`;

    this.state.messages.push({
      role: 'assistant',
      content: greeting,
    });

    return greeting;
  }

  /**
   * Process user message and generate response
   */
  async processUserMessage(userMessage: string): Promise<string> {
    console.log('🤖 Designer Agent - Processing user message:', userMessage);
    console.log('📊 Current conversation stage:', this.state.stage);
    console.log('💬 Total messages so far:', this.state.messages.length);

    // Add user message to history
    this.state.messages.push({
      role: 'user',
      content: userMessage,
    });

    console.log('👤 User message added to conversation history');

    // Process based on current stage
    let response: string;

    try {
      switch (this.state.stage) {
        case ConversationStage.INITIAL:
          console.log('🔄 Stage: INITIAL - Capturing automation goal');
          response = await this.handleInitialStage(userMessage);
          break;
        case ConversationStage.DIAGRAM_DRAFT:
          console.log('📊 Stage: DIAGRAM_DRAFT - Generating initial diagram');
          response = await this.handleDiagramDraftStage(userMessage);
          break;
        case ConversationStage.CLARIFICATION:
          console.log('🔍 Stage: CLARIFICATION - Asking targeted follow-ups');
          response = await this.handleClarificationStage(userMessage);
          break;
        case ConversationStage.RECOMMENDATIONS:
          console.log('💡 Stage: RECOMMENDATIONS - Offering AI agent suggestions');
          response = await this.handleRecommendationsStage(userMessage);
          break;
        case ConversationStage.CREDENTIALS:
          console.log('🔑 Stage: CREDENTIALS - Collecting exact credentials');
          response = await this.handleCredentialsStage(userMessage);
          break;
        case ConversationStage.APPROVAL:
          console.log('✅ Stage: APPROVAL - Final blueprint approval');
          response = await this.handleApprovalStage(userMessage);
          break;
        case ConversationStage.COMPLETE:
          console.log('🎉 Stage: COMPLETE - Blueprint delivered');
          response = "Your automation blueprint is complete! The Builder Agent will now implement it.";
          break;
        default:
          console.log('❓ Stage: UNKNOWN - Using fallback response');
          response = await this.generateResponse(userMessage);
      }

      console.log('✅ Designer Agent - Response generated successfully');
      console.log('📝 Response content:', response.substring(0, 100) + (response.length > 100 ? '...' : ''));
      console.log('📊 Updated conversation state:', {
        stage: this.state.stage,
        messageCount: this.state.messages.length,
        hasBusinessContext: !!this.state.businessContext,
        hasTeamDesign: !!this.state.teamDesign,
        hasBlueprint: !!this.state.blueprint
      });

      // Add assistant response to history
      this.state.messages.push({
        role: 'assistant',
        content: response,
      });

      console.log('🤖 Assistant response added to conversation history');

      this.state.updatedAt = new Date();

      return response;
    } catch (error) {
      console.error('❌ Designer Agent - Error processing message:', error);
      const errorResponse = "I'm sorry, I encountered an error processing your message. Please try again.";
      
      this.state.messages.push({
        role: 'assistant',
        content: errorResponse,
      });

      return errorResponse;
    }
  }

  /**
   * Handle initial stage - capture automation goal and generate initial diagram
   */
  private async handleInitialStage(userMessage: string): Promise<string> {
    // User describes what they want to automate
    try {
      // Parse user's goal to extract basic automation requirements
      const analysis = await deepseek.analyzeBusinessRequirements(userMessage);
      
      // Store business context
      this.state.businessContext = {
        industry: analysis.industry,
        businessType: analysis.businessType,
        requiredFunctions: analysis.requiredFunctions,
        automationOpportunities: analysis.automationOpportunities,
        requiredIntegrations: analysis.requiredIntegrations,
      };

      // Generate initial automation steps from user description
      this.state.automationSteps = this.parseAutomationSteps(userMessage, analysis);

      // Move to diagram draft stage
      this.state.stage = ConversationStage.DIAGRAM_DRAFT;

      // Generate response with initial diagram description and first clarification
      let response = `Perfect! Here's my initial understanding:\n\n`;
      response += `**Your Automation:**\n`;
      this.state.automationSteps?.forEach((step, index) => {
        const aiLabel = step.type === 'ai-agent' ? ' 🤖 (AI)' : '';
        response += `${index + 1}. ${step.name}${aiLabel}\n`;
      });
      response += `\n`;
      response += `I've drafted a ${this.state.automationSteps?.length}-step workflow for you. `;
      
      // Ask first clarification question
      if (analysis.requiredIntegrations && analysis.requiredIntegrations.length > 0) {
        const firstIntegration = analysis.requiredIntegrations[0];
        response += `\nLet me clarify one thing: For ${firstIntegration}, which specific service do you use? (e.g., Gmail, SendGrid, Outlook, etc.)`;
      } else {
        response += `\nDoes this flow look correct, or would you like me to adjust any steps?`;
      }
      
      return response;
    } catch (error) {
      console.error('Error analyzing automation goal:', error);
      return this.generateResponse(userMessage);
    }
  }

  /**
   * Parse user's description into automation steps
   */
  private parseAutomationSteps(userMessage: string, analysis: any): AutomationStep[] {
    const steps: AutomationStep[] = [];
    
    // Add trigger step
    steps.push({
      id: 'step-1',
      stepNumber: 1,
      type: 'trigger',
      name: 'Trigger: ' + (userMessage.toLowerCase().includes('webhook') ? 'Webhook event' : 'Scheduled trigger'),
      nextSteps: [{ stepId: 'step-2' }]
    });

    // Add steps for each required function
    analysis.requiredFunctions?.forEach((func: string, index: number) => {
      const stepNum = index + 2;
      const isAIWorthy = func.toLowerCase().includes('summarize') || 
                        func.toLowerCase().includes('classify') ||
                        func.toLowerCase().includes('generate') ||
                        func.toLowerCase().includes('enrich') ||
                        func.toLowerCase().includes('analyze');
      
      steps.push({
        id: `step-${stepNum}`,
        stepNumber: stepNum,
        type: isAIWorthy ? 'ai-agent' : 'action',
        name: func,
        nextSteps: stepNum < analysis.requiredFunctions.length + 1 ? [{ stepId: `step-${stepNum + 1}` }] : [{ stepId: 'step-success' }]
      });
    });

    // Add success step
    steps.push({
      id: 'step-success',
      stepNumber: steps.length + 1,
      type: 'success',
      name: 'Complete',
      nextSteps: []
    });

    return steps;
  }

  /**
   * Handle diagram draft stage - user reviews initial diagram
   */
  private async handleDiagramDraftStage(userMessage: string): Promise<string> {
    // Move to clarification stage
    this.state.stage = ConversationStage.CLARIFICATION;
    return this.handleClarificationStage(userMessage);
  }

  /**
   * Handle clarification stage - ask targeted follow-ups
   */
  private async handleClarificationStage(userMessage: string): Promise<string> {
    // Use AI to generate targeted clarification questions
    const response = await deepseek.generateDesignerResponse(
      DESIGNER_SYSTEM_PROMPT,
      this.state.messages,
      this.state.businessContext
    );

    // Check if we have all clarifications
    if (this.hasAllClarifications()) {
      this.state.stage = ConversationStage.RECOMMENDATIONS;
      return response + "\n\nI have a few recommendations to make your automation more robust...";
    }

    return response;
  }

  /**
   * Handle recommendations stage - offer AI agent suggestions
   */
  private async handleRecommendationsStage(userMessage: string): Promise<string> {
    // Generate recommendations based on current steps
    const recommendations = this.generateRecommendations();
    this.state.recommendations = recommendations;

    if (recommendations.length === 0) {
      // No recommendations, move to credentials
      this.state.stage = ConversationStage.CREDENTIALS;
      return this.handleCredentialsStage(userMessage);
    }

    // Present recommendations
    let response = `I have ${recommendations.length} recommendations to improve your automation:\n\n`;
    recommendations.forEach((rec, index) => {
      response += `${index + 1}. **${rec.title}**\n   ${rec.rationale}\n\n`;
    });
    response += `Would you like to add any of these? (Just say the number, or "skip" to continue)`;

    return response;
  }

  /**
   * Generate recommendations based on automation steps
   */
  private generateRecommendations(): any[] {
    const recommendations: any[] = [];
    const steps = this.state.automationSteps || [];

    // Check for AI-worthy steps
    steps.forEach((step, index) => {
      if (step.type === 'action' && step.name.toLowerCase().includes('email')) {
        recommendations.push({
          title: 'Add AI Email Summarizer',
          rationale: 'Automatically summarize email threads before processing',
          type: 'ai-agent',
          insertAfter: step.stepNumber
        });
      }

      if (step.type === 'action' && !step.config?.retry) {
        recommendations.push({
          title: 'Add Retry with Exponential Backoff',
          rationale: `Ensure ${step.name} succeeds even if temporary failures occur`,
          type: 'retry',
          stepNumber: step.stepNumber
        });
      }
    });

    // Add error handling recommendation
    if (!steps.some(s => s.type === 'error-handler')) {
      recommendations.push({
        title: 'Add Slack Alert on Failure',
        rationale: 'Get notified immediately when automation fails',
        type: 'alert'
      });
    }

    return recommendations.slice(0, 3); // Limit to top 3
  }

  /**
   * Check if we have all clarifications
   */
  private hasAllClarifications(): boolean {
    // Simple heuristic: if we have integrations specified and steps defined
    return !!(this.state.businessContext?.requiredIntegrations && 
              this.state.automationSteps && 
              this.state.automationSteps.length > 2);
  }

  // Old stage handlers removed for Automation mode
  // These were for AI Workforce mode which is not the current focus

  /**
   * Request necessary credentials
   */
  private requestCredentials(): string {
    const integrations = this.state.businessContext?.requiredIntegrations || [];
    
    if (integrations.length === 0) {
      this.state.stage = ConversationStage.APPROVAL;
      return this.generateFinalApproval();
    }

    let response = `Perfect! To make your AI team fully functional, I need to connect them to your business platforms.\n\n`;
    response += `I'll show you connection buttons for each platform. Click them to securely provide your credentials.\n\n`;
    response += `**Required Platforms:**\n`;
    integrations.forEach((integration, index) => {
      response += `${index + 1}. ${integration}\n`;
    });
    response += `\n\nAll credentials are encrypted and stored securely. We'll never share or misuse your data.`;

    return response;
  }

  /**
   * Handle credentials stage
   */
  private async handleCredentialsStage(userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();

    // Check if user is indicating credentials are saved/ready
    if (lowerMessage.includes('credentials saved') || lowerMessage.includes('saved successfully') || 
        lowerMessage.includes('continue') || lowerMessage.includes('ready') ||
        lowerMessage.includes('provided') || lowerMessage.includes('done')) {
      
      console.log('🔑 Credentials stage - User indicates credentials are saved, progressing to approval');
      this.state.stage = ConversationStage.APPROVAL;
      
      // Generate automation blueprint
      this.state.blueprint = await this.generateAutomationBlueprint();
      
      return this.generateFinalApproval();
    }

    // If no integrations, skip to approval
    if (!this.state.businessContext?.requiredIntegrations || 
        this.state.businessContext.requiredIntegrations.length === 0) {
      this.state.stage = ConversationStage.APPROVAL;
      this.state.blueprint = await this.generateAutomationBlueprint();
      return this.generateFinalApproval();
    }

    // Request credentials for each integration
    const response = `Perfect! Now I need credentials for the following integrations:\n\n`;
    let requests = response;
    this.state.businessContext.requiredIntegrations.forEach((integration, index) => {
      requests += `${index + 1}. **${integration}** - I'll collect the exact fields needed (API key, OAuth, etc.)\n`;
    });
    requests += `\nPlease provide these credentials when ready, and I'll verify them for your automation.`;
    
    return requests;
  }

  /**
   * Generate credential requests
   */
  private async generateCredentialRequests(): Promise<string> {
    const collector = new CredentialCollector(this.state.discoveredIntegrations || []);
    return await collector.generateCredentialRequest();
  }

  /**
   * Handle approval stage
   */
  private async handleApprovalStage(userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();

    // Check if user is indicating credentials are saved/ready
    if (lowerMessage.includes('credentials saved') || lowerMessage.includes('saved successfully') || 
        lowerMessage.includes('continue') || lowerMessage.includes('ready') ||
        lowerMessage.includes('provided') || lowerMessage.includes('done')) {
      
      console.log('🔑 Approval stage - User indicates credentials are saved, ready to build');
      return `Great! All credentials are saved. Ready to finalize this Automation blueprint?\n\n` +
             `Just say "Yes, finalize it!" and I'll prepare the complete blueprint for the Builder Agent.`;
    }

    if (lowerMessage.includes('approve') || lowerMessage.includes('finalize') || 
        lowerMessage.includes('yes') || lowerMessage.includes('proceed') ||
        lowerMessage.includes("let's build") || lowerMessage.includes('ready')) {
      
      this.state.stage = ConversationStage.COMPLETE;

      return `Perfect! Your Automation blueprint is ready! 🎉\n\n` +
             `**Blueprint Summary:**\n` +
             `- Type: Automation\n` +
             `- Steps: ${this.state.automationSteps?.length || 0}\n` +
             `- AI Agents: ${this.state.automationSteps?.filter(s => s.type === 'ai-agent').length || 0}\n` +
             `- Integrations: ${this.state.businessContext?.requiredIntegrations?.length || 0}\n\n` +
             `The Builder Agent will now implement your automation with all the specified triggers, actions, and AI steps.\n\n` +
             `You'll be able to monitor the build progress in real-time. This usually takes 2-5 minutes.\n\n` +
             `Your automation will be ready to run!`;
    }

    return await deepseek.generateDesignerResponse(
      DESIGNER_SYSTEM_PROMPT,
      this.state.messages,
      { businessContext: this.state.businessContext, automationSteps: this.state.automationSteps }
    );
  }

  /**
   * Generate final approval message
   */
  /**
   * Generate automation blueprint
   */
  private async generateAutomationBlueprint(): Promise<any> {
    return {
      type: 'Automation',
      workflow_id: this.state.sessionId,
      workflow_name: `${this.state.businessContext?.businessType || 'Custom'} Automation`,
      created_at: new Date().toISOString(),
      user_id: this.state.userId,
      
      business_context: {
        industry: this.state.businessContext?.industry || 'General',
        business_type: this.state.businessContext?.businessType || 'Custom',
        goals: this.state.businessContext?.primaryGoals || [],
      },
      
      steps: this.state.automationSteps || [],
      
      triggers: {
        type: this.state.automationSteps?.[0]?.name.includes('Webhook') ? 'webhook' : 'scheduled',
        webhook: null, // Will be populated by webhook API
        schedule: null,
      },
      
      mappings: {},
      
      ai_steps: this.state.automationSteps
        ?.filter(s => s.type === 'ai-agent')
        .reduce((acc, step) => {
          acc[step.id] = {
            llm: 'deepseek',
            prompt: `Execute ${step.name}`,
            goal: step.description || step.name,
            tools: step.config?.aiAgent?.tools || []
          };
          return acc;
        }, {} as Record<string, any>),
      
      credentials: this.state.credentials || {},
      
      resilience: {
        retries: { policy: 'exponential', maxAttempts: 3, backoff: '2s' },
        fallbacks: [],
        timeouts: { default: 30000 }
      },
      
      logging: {
        level: 'info',
        redactions: ['password', 'secret', 'token'],
        metrics: ['success_rate', 'latency', 'retry_count']
      },
      
      testing: {
        samplePayloads: [],
        expectedOutputs: []
      },
      
      status: 'draft',
      approved_by_user: false,
    };
  }

  private generateFinalApproval(): string {
    const aiSteps = this.state.automationSteps?.filter(s => s.type === 'ai-agent').length || 0;
    const totalSteps = this.state.automationSteps?.length || 0;
    
    return `Perfect! Here's your Automation summary:\n\n` +
           `**Type:** Automation (step-based workflow)\n` +
           `**Total Steps:** ${totalSteps}\n` +
           `**AI-Powered Steps:** ${aiSteps}\n` +
           `**Integrations:** ${this.state.businessContext?.requiredIntegrations?.join(', ') || 'None'}\n\n` +
           `**Trigger:** ${this.state.automationSteps?.[0]?.name || 'Not specified'}\n` +
           `**Key Actions:** ${this.state.businessContext?.requiredFunctions?.slice(0, 3).join(', ') || 'Various actions'}\n\n` +
           `Everything looks good! Ready to finalize this Automation blueprint?\n\n` +
           `Just say "Yes, finalize it!" and I'll prepare everything for the Builder Agent.`;
  }

  /**
   * Generate generic response
   */
  private async generateResponse(userMessage: string): Promise<string> {
    try {
      console.log('Generating response for message:', userMessage);
      console.log('Current state:', this.state);
      
      const response = await deepseek.generateDesignerResponse(
        DESIGNER_SYSTEM_PROMPT,
        this.state.messages,
        this.state.businessContext
      );
      
      console.log('Generated response:', response);
      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      return "I'm sorry, I'm having trouble processing your message right now. Could you please try again?";
    }
  }

  /**
   * Check if we have enough information
   */
  private hasEnoughInformation(): boolean {
    const context = this.state.businessContext;
    return !!(
      context?.industry &&
      context?.businessType &&
      context?.requiredFunctions &&
      context.requiredFunctions.length > 0
    );
  }

  /**
   * Get current state
   */
  getState(): ConversationState {
    return this.state;
  }

  /**
   * Load existing state
   */
  loadState(state: ConversationState) {
    this.state = state;
  }
}

/**
 * Business Analyzer
 * Analyzes business requirements and designs team structure
 */
export class BusinessAnalyzer {
  constructor(
    private businessContext: BusinessContext,
    private designMode: 'Automation' | 'AI Workforce'
  ) {}

  async designTeamStructure(): Promise<TeamDesign> {
    const functions = this.businessContext.requiredFunctions || [];
    const totalAgents = functions.length;
    
    // For 'AI Workforce', a manager is assigned for 3 or more functions.
    // For 'Automation', a manager is never assigned.
    const hasManager = this.designMode === 'AI Workforce' && totalAgents >= 3;

    const agents: AgentDefinition[] = [];

    // Create Manager Agent if needed
    if (hasManager) {
      agents.push({
        id: 'manager-001',
        type: 'Manager',
        name: 'Operations Manager',
        role: 'Team Coordinator',
        responsibilities: [
          'Task distribution and prioritization',
          'Monitor team performance',
          'Handle escalations',
          'Generate reports',
        ],
        tools: ['task_scheduler', 'team_monitor', 'report_generator'],
        manages: functions.map((_, index) => `specialist-${String(index + 1).padStart(3, '0')}`),
      });
    }

    // Create Specialist Agents for each function
    functions.forEach((func, index) => {
      agents.push({
        id: `specialist-${String(index + 1).padStart(3, '0')}`,
        type: 'Specialist',
        name: `${func} Agent`,
        role: func,
        responsibilities: this.generateResponsibilities(func),
        tools: this.generateTools(func),
        reportsTo: hasManager ? 'manager-001' : undefined,
      });
    });

    return {
      hasManager,
      totalAgents: agents.length,
      agents,
      workflowPattern: hasManager ? 'parallel' : 'sequential',
      communicationPattern: hasManager ? 'hub_and_spoke' : 'sequential',
    };
  }

  private generateResponsibilities(functionName: string): string[] {
    // Generate responsibilities based on function name
    const responsibilities: Record<string, string[]> = {
      'Customer Support': [
        'Answer customer inquiries',
        'Handle returns and refunds',
        'Manage support tickets',
        'Escalate complex issues',
      ],
      'Inventory Management': [
        'Monitor stock levels',
        'Trigger reorder alerts',
        'Forecast demand',
        'Optimize inventory',
      ],
      'Marketing': [
        'Create marketing campaigns',
        'Manage social media',
        'Generate content',
        'Track campaign performance',
      ],
      'Order Processing': [
        'Process new orders',
        'Update order status',
        'Coordinate shipping',
        'Handle order modifications',
      ],
      'Analytics': [
        'Generate reports',
        'Track KPIs',
        'Analyze trends',
        'Provide insights',
      ],
    };

    return responsibilities[functionName] || [
      `Handle ${functionName} tasks`,
      `Monitor ${functionName} processes`,
      `Report ${functionName} metrics`,
    ];
  }

  private generateTools(functionName: string): string[] {
    // Generate tools based on function name
    const tools: Record<string, string[]> = {
      'Customer Support': ['email_client', 'knowledge_base', 'ticket_system', 'sentiment_analyzer'],
      'Inventory Management': ['inventory_tracker', 'demand_forecaster', 'reorder_calculator'],
      'Marketing': ['campaign_manager', 'social_media_api', 'content_generator', 'analytics'],
      'Order Processing': ['order_manager', 'shipping_api', 'payment_processor'],
      'Analytics': ['data_analyzer', 'report_generator', 'dashboard', 'metrics_tracker'],
    };

    return tools[functionName] || ['generic_tool', 'api_connector'];
  }
}

/**
 * Credential Collector
 * Handles credential collection for integrations
 */
export class CredentialCollector {
  constructor(private discoveredIntegrations: DiscoveredIntegration[]) {}

  async generateCredentialRequest(): Promise<string> {
    let request = `Here's what I need for each integration:\n\n`;

    this.discoveredIntegrations.forEach((integration, index) => {
      request += `**${index + 1}. ${integration.platform}**\n`;
      if (integration.credentials.length > 0) {
        integration.credentials.forEach(cred => {
          request += `   - ${cred.name}: ${cred.description}\n`;
        });
      } else {
        request += `   - I couldn't automatically determine the required credentials for this platform. You may need to provide them manually.\n`;
      }
      request += `\n`;
    });

    request += `You can provide these through the secure credential form, or let me know if you need help finding them.`;

    return request;
  }
}

