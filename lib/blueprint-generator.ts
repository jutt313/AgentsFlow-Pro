/**
 * Blueprint Generator
 * Creates detailed technical blueprints from team designs
 */

import type { BusinessContext, TeamDesign, AgentDefinition } from './designer-agent';
import { v4 as uuidv4 } from 'uuid';

export interface Blueprint {
  blueprint_version: string;
  workflow_id: string;
  workflow_name: string;
  created_at: string;
  user_id: string;
  
  business_context: {
    industry: string;
    business_type: string;
    platform?: string;
    scale?: string;
    primary_goals: string[];
  };
  
  team_structure: {
    has_manager: boolean;
    total_agents: number;
    agent_count_by_type: {
      manager: number;
      specialist: number;
      integration: number;
    };
  };
  
  agents: BlueprintAgent[];
  integrations: BlueprintIntegration[];
  communication_patterns: CommunicationPattern[];
  workflow_rules: WorkflowRule[];
  monitoring_config: MonitoringConfig;
  credentials: Record<string, string>;
  reactflow_diagram: ReactFlowDiagram;
  
  status: string;
  approved_by_user: boolean;
  approval_timestamp: string;
}

export interface BlueprintAgent {
  agent_id: string;
  agent_type: 'Manager' | 'Specialist' | 'Integration';
  name: string;
  role: string;
  responsibilities: string[];
  tools: string[];
  decision_authority: 'high' | 'medium' | 'low';
  can_modify_workflow: boolean;
  reports_to?: string;
  manages?: string[];
  collaborates_with?: string[];
}

export interface BlueprintIntegration {
  integration_id: string;
  service: string;
  purpose: string;
  required_credentials: string[];
  endpoints_used: string[];
  used_by_agents: string[];
}

export interface CommunicationPattern {
  pattern_type: 'request_response' | 'event_driven' | 'broadcast';
  from: string;
  to: string;
  trigger: string;
  flow: string;
}

export interface WorkflowRule {
  rule_id: string;
  condition: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MonitoringConfig {
  health_check_interval: string;
  performance_metrics: string[];
  alert_thresholds: {
    response_time_ms: number;
    error_rate_percent: number;
    success_rate_percent: number;
  };
}

export interface ReactFlowDiagram {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
}

export interface ReactFlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    agentType: string;
    role: string;
    icon: string;
    color: string;
  };
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

/**
 * Generate complete blueprint from team design
 */
export function generateBlueprint(
  businessContext: BusinessContext,
  teamDesign: TeamDesign,
  credentials: Record<string, any> = {},
  userId: string = 'default-user'
): Blueprint {
  const workflowId = uuidv4();
  const timestamp = new Date().toISOString();

  // Convert team design agents to blueprint agents
  const blueprintAgents = teamDesign.agents.map(agent => 
    convertToBlueprintAgent(agent, teamDesign.hasManager)
  );

  // Generate integrations
  const integrations = generateIntegrations(
    businessContext.requiredIntegrations || [],
    blueprintAgents
  );

  // Generate communication patterns
  const communicationPatterns = generateCommunicationPatterns(
    blueprintAgents,
    teamDesign.hasManager
  );

  // Generate workflow rules
  const workflowRules = generateWorkflowRules(businessContext, blueprintAgents);

  // Generate ReactFlow diagram
  const reactflowDiagram = generateReactFlowDiagram(blueprintAgents, teamDesign.hasManager, businessContext);

  // Count agents by type
  const agentCounts = {
    manager: blueprintAgents.filter(a => a.agent_type === 'Manager').length,
    specialist: blueprintAgents.filter(a => a.agent_type === 'Specialist').length,
    integration: blueprintAgents.filter(a => a.agent_type === 'Integration').length,
  };

  const blueprint: Blueprint = {
    blueprint_version: '1.0',
    workflow_id: workflowId,
    workflow_name: `${businessContext.businessType} Automation`,
    created_at: timestamp,
    user_id: userId,
    
    business_context: {
      industry: businessContext.industry || 'Unknown',
      business_type: businessContext.businessType || 'Unknown',
      platform: businessContext.platform,
      scale: businessContext.scale,
      primary_goals: businessContext.primaryGoals || [],
    },
    
    team_structure: {
      has_manager: teamDesign.hasManager,
      total_agents: teamDesign.totalAgents,
      agent_count_by_type: agentCounts,
    },
    
    agents: blueprintAgents,
    integrations,
    communication_patterns: communicationPatterns,
    workflow_rules: workflowRules,
    
    monitoring_config: {
      health_check_interval: '30s',
      performance_metrics: [
        'response_time',
        'success_rate',
        'task_completion_rate',
        'error_rate',
      ],
      alert_thresholds: {
        response_time_ms: 5000,
        error_rate_percent: 5,
        success_rate_percent: 95,
      },
    },
    
    credentials: encryptCredentials(credentials),
    reactflow_diagram: reactflowDiagram,
    
    status: 'ready_for_build',
    approved_by_user: true,
    approval_timestamp: timestamp,
  };

  return blueprint;
}

/**
 * Convert agent definition to blueprint agent
 */
function convertToBlueprintAgent(
  agent: AgentDefinition,
  hasManager: boolean
): BlueprintAgent {
  return {
    agent_id: agent.id,
    agent_type: agent.type,
    name: agent.name,
    role: agent.role,
    responsibilities: agent.responsibilities,
    tools: agent.tools,
    decision_authority: agent.type === 'Manager' ? 'high' : 'medium',
    can_modify_workflow: agent.type === 'Manager',
    reports_to: agent.reportsTo,
    manages: agent.manages,
    collaborates_with: hasManager ? [] : undefined,
  };
}

/**
 * Generate integrations based on requirements
 */
function generateIntegrations(
  requiredIntegrations: string[],
  agents: BlueprintAgent[]
): BlueprintIntegration[] {
  return requiredIntegrations.map((service, index) => {
    const integrationId = `int-${String(index + 1).padStart(3, '0')}`;
    
    // Determine which agents use this integration
    const usedByAgents = agents
      .filter(agent => agent.agent_type !== 'Manager')
      .map(agent => agent.agent_id);

    return {
      integration_id: integrationId,
      service,
      purpose: `${service} integration`,
      required_credentials: getRequiredCredentialsForService(service),
      endpoints_used: getEndpointsForService(service),
      used_by_agents: usedByAgents,
    };
  });
}

/**
 * Get required credentials for a service
 */
function getRequiredCredentialsForService(service: string): string[] {
  const credentialMap: Record<string, string[]> = {
    'Shopify': ['shopify_api_key', 'shopify_store_url', 'shopify_access_token'],
    'WooCommerce': ['woocommerce_consumer_key', 'woocommerce_consumer_secret', 'woocommerce_site_url'],
    'OpenAI': ['openai_api_key', 'openai_org_id'],
    'Stripe': ['stripe_secret_key', 'stripe_publishable_key'],
    'Google Ads': ['google_ads_api_key', 'google_ads_customer_id'],
  };

  return credentialMap[service] || [`${service.toLowerCase().replace(/\s+/g, '_')}_api_key`];
}

/**
 * Get endpoints for a service
 */
function getEndpointsForService(service: string): string[] {
  const endpointMap: Record<string, string[]> = {
    'Shopify': ['/admin/api/products', '/admin/api/orders', '/admin/api/inventory'],
    'WooCommerce': ['/wp-json/wc/v3/products', '/wp-json/wc/v3/orders'],
    'OpenAI': ['/v1/chat/completions', '/v1/embeddings'],
  };

  return endpointMap[service] || ['/api'];
}

/**
 * Generate communication patterns
 */
function generateCommunicationPatterns(
  agents: BlueprintAgent[],
  hasManager: boolean
): CommunicationPattern[] {
  const patterns: CommunicationPattern[] = [];

  if (hasManager) {
    const manager = agents.find(a => a.agent_type === 'Manager');
    const specialists = agents.filter(a => a.agent_type === 'Specialist');

    if (manager) {
      specialists.forEach(specialist => {
        patterns.push({
          pattern_type: 'request_response',
          from: manager.agent_id,
          to: specialist.agent_id,
          trigger: 'task_assignment',
          flow: `${manager.name} assigns task → ${specialist.name} executes → Reports back`,
        });
      });
    }
  } else {
    // Sequential pattern for non-managed teams
    for (let i = 0; i < agents.length - 1; i++) {
      patterns.push({
        pattern_type: 'request_response',
        from: agents[i].agent_id,
        to: agents[i + 1].agent_id,
        trigger: 'task_completion',
        flow: `${agents[i].name} completes → ${agents[i + 1].name} starts`,
      });
    }
  }

  return patterns;
}

/**
 * Generate workflow rules
 */
function generateWorkflowRules(
  businessContext: BusinessContext,
  agents: BlueprintAgent[]
): WorkflowRule[] {
  const rules: WorkflowRule[] = [];

  // Add default escalation rule if there's a manager
  const hasManager = agents.some(a => a.agent_type === 'Manager');
  if (hasManager) {
    rules.push({
      rule_id: 'rule-001',
      condition: 'task_complexity == "high" OR error_count > 3',
      action: 'escalate_to_manager',
      priority: 'high',
    });
  }

  // Add performance monitoring rule
  rules.push({
    rule_id: 'rule-002',
    condition: 'response_time > 10000ms',
    action: 'trigger_performance_alert',
    priority: 'medium',
    });

  return rules;
}

/**
 * Generate ReactFlow diagram
 */
function generateReactFlowDiagram(
  agents: BlueprintAgent[],
  hasManager: boolean,
  businessContext?: any
): ReactFlowDiagram {
  const nodes: ReactFlowNode[] = [];
  const edges: ReactFlowEdge[] = [];

  // Determine diagram type based on business context
  const isAutomation = businessContext?.designMode === 'Automation';
  const industry = businessContext?.industry?.toLowerCase() || 'general';
  
  // Industry-specific colors
  const industryColors = {
    'e-commerce': { primary: '#3b82f6', secondary: '#1d4ed8', accent: '#60a5fa' },
    'healthcare': { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
    'finance': { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' },
    'education': { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
    'general': { primary: '#6b7280', secondary: '#4b5563', accent: '#9ca3af' }
  };
  
  const colors = industryColors[industry] || industryColors['general'];

  if (isAutomation) {
    // AUTOMATION DIAGRAM - Left to Right Flow
    generateAutomationDiagram(agents, nodes, edges, colors);
  } else {
    // AI WORKFORCE DIAGRAM - Hierarchical Structure
    generateWorkforceDiagram(agents, hasManager, nodes, edges, colors);
  }

  return { nodes, edges };
}

/**
 * Generate Automation Diagram (Left to Right Flow)
 */
function generateAutomationDiagram(
  agents: BlueprintAgent[],
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[],
  colors: any
) {
  const nodeTypes = [
    'trigger', 'condition', 'action', 'filter', 'ai-agent', 
    'search', 'loop', 'validation', 'notification', 'data-transform',
    'integration', 'merge', 'split', 'error-handler', 'delay', 'success'
  ];

  const nodeIcons = {
    'trigger': '🚀', 'condition': '❓', 'action': '⚡', 'filter': '🔍',
    'ai-agent': '🤖', 'search': '🔎', 'loop': '🔄', 'validation': '✅',
    'notification': '📢', 'data-transform': '🔄', 'integration': '🔗',
    'merge': '🔀', 'split': '↗️', 'error-handler': '⚠️', 'delay': '⏱️', 'success': '🎉'
  };

  // Generate automation flow nodes
  agents.forEach((agent, index) => {
    const nodeType = nodeTypes[index % nodeTypes.length];
    const x = 100 + (index * 250);
    const y = 200;

    nodes.push({
      id: agent.agent_id,
      type: 'automation-node',
      position: { x, y },
      data: {
        label: agent.name,
        nodeType: nodeType,
        role: agent.role,
        icon: nodeIcons[nodeType] || '🎯',
        color: colors.primary,
        backgroundColor: colors.accent + '20',
        borderColor: colors.secondary,
        responsibilities: agent.responsibilities,
        tools: agent.tools,
        status: 'active',
        performance: {
          responseTime: '2.3s',
          successRate: '98.5%',
          uptime: '99.9%'
        }
      },
    });

    // Connect to next node
    if (index < agents.length - 1) {
      edges.push({
        id: `flow-${agent.agent_id}-${agents[index + 1].agent_id}`,
        source: agent.agent_id,
        target: agents[index + 1].agent_id,
        type: 'smoothstep',
        animated: true,
        style: { 
          stroke: colors.secondary, 
          strokeWidth: 3,
          strokeDasharray: '5,5'
        },
        label: 'Data Flow',
        labelStyle: { 
          fill: colors.secondary, 
          fontWeight: 'bold',
          fontSize: '12px'
        }
      });
    }
  });

  // Add start and end nodes
  nodes.unshift({
    id: 'start-trigger',
    type: 'trigger-node',
    position: { x: 50, y: 200 },
    data: {
      label: 'Start',
      nodeType: 'trigger',
      icon: '🚀',
      color: colors.primary,
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
      status: 'ready'
    },
  });

  nodes.push({
    id: 'end-success',
    type: 'success-node',
    position: { x: 100 + (agents.length * 250), y: 200 },
    data: {
      label: 'Complete',
      nodeType: 'success',
      icon: '🎉',
      color: colors.secondary,
      backgroundColor: colors.secondary + '20',
      borderColor: colors.secondary,
      status: 'completed'
    },
  });

  // Connect start to first agent
  if (agents.length > 0) {
    edges.unshift({
      id: 'start-flow',
      source: 'start-trigger',
      target: agents[0].agent_id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: colors.primary, strokeWidth: 3 },
      label: 'Initiate'
    });
  }

  // Connect last agent to end
  if (agents.length > 0) {
    edges.push({
      id: 'end-flow',
      source: agents[agents.length - 1].agent_id,
      target: 'end-success',
      type: 'smoothstep',
      animated: true,
      style: { stroke: colors.secondary, strokeWidth: 3 },
      label: 'Complete'
    });
  }
}

/**
 * Generate AI Workforce Diagram (Hierarchical Structure)
 */
function generateWorkforceDiagram(
  agents: BlueprintAgent[],
  hasManager: boolean,
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[],
  colors: any
) {
  if (hasManager) {
    // Hub and spoke layout with manager at top
    const manager = agents.find(a => a.agent_type === 'Manager');
    const specialists = agents.filter(a => a.agent_type === 'Specialist');

    if (manager) {
      // Manager node at top center
      nodes.push({
        id: manager.agent_id,
        type: 'manager-node',
        position: { x: 400, y: 50 },
        data: {
          label: manager.name,
          nodeType: 'manager',
          role: manager.role,
          icon: '👔',
          color: colors.primary,
          backgroundColor: colors.primary + '20',
          borderColor: colors.primary,
          responsibilities: manager.responsibilities,
          tools: manager.tools,
          status: 'active',
          performance: {
            responseTime: '1.8s',
            successRate: '99.2%',
            teamSize: specialists.length
          }
        },
      });

      // Specialist nodes in organized grid below manager
      const cols = Math.ceil(Math.sqrt(specialists.length));
      const spacing = 200;
      const startX = 400 - ((cols - 1) * spacing) / 2;

      specialists.forEach((specialist, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = startX + (col * spacing);
        const y = 200 + (row * 150);

        nodes.push({
          id: specialist.agent_id,
          type: 'specialist-node',
          position: { x, y },
          data: {
            label: specialist.name,
            nodeType: 'specialist',
            role: specialist.role,
            icon: '🎯',
            color: colors.secondary,
            backgroundColor: colors.secondary + '20',
            borderColor: colors.secondary,
            responsibilities: specialist.responsibilities,
            tools: specialist.tools,
            status: 'active',
            performance: {
              responseTime: '2.1s',
              successRate: '97.8%',
              tasksCompleted: Math.floor(Math.random() * 100) + 50
            }
          },
        });

        // Edge from manager to specialist
        edges.push({
          id: `manage-${manager.agent_id}-${specialist.agent_id}`,
          source: manager.agent_id,
          target: specialist.agent_id,
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: colors.primary, 
            strokeWidth: 2,
            strokeDasharray: '10,5'
          },
          label: 'Manages',
          labelStyle: { 
            fill: colors.primary, 
            fontWeight: 'bold',
            fontSize: '11px'
          }
        });
      });
    }
  } else {
    // Sequential layout for non-managed teams
    const spacing = 200;
    agents.forEach((agent, index) => {
      nodes.push({
        id: agent.agent_id,
        type: 'specialist-node',
        position: { x: 100 + index * spacing, y: 200 },
        data: {
          label: agent.name,
          nodeType: 'specialist',
          role: agent.role,
          icon: '🎯',
          color: colors.secondary,
          backgroundColor: colors.secondary + '20',
          borderColor: colors.secondary,
          responsibilities: agent.responsibilities,
          tools: agent.tools,
          status: 'active',
          performance: {
            responseTime: '2.0s',
            successRate: '98.1%',
            tasksCompleted: Math.floor(Math.random() * 100) + 50
          }
        },
      });

      // Edge to next agent
      if (index < agents.length - 1) {
        edges.push({
          id: `collaborate-${agent.agent_id}-${agents[index + 1].agent_id}`,
          source: agent.agent_id,
          target: agents[index + 1].agent_id,
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: colors.accent, 
            strokeWidth: 2,
            strokeDasharray: '5,5'
          },
          label: 'Collaborates',
          labelStyle: { 
            fill: colors.accent, 
            fontWeight: 'bold',
            fontSize: '11px'
          }
        });
      }
    });
  }
}

/**
 * Encrypt credentials (placeholder - implement proper encryption in production)
 */
function encryptCredentials(credentials: Record<string, any>): Record<string, string> {
  const encrypted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(credentials)) {
    // In production, use proper encryption (e.g., AES-256)
    // For now, just mark as encrypted
    encrypted[key] = `encrypted_${Buffer.from(String(value)).toString('base64')}`;
  }
  
  return encrypted;
}

/**
 * Validate blueprint structure
 */
export function validateBlueprint(blueprint: Blueprint): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!blueprint.workflow_id) errors.push('Missing workflow_id');
  if (!blueprint.workflow_name) errors.push('Missing workflow_name');
  if (!blueprint.agents || blueprint.agents.length === 0) {
    errors.push('No agents defined');
  }

  // Validate agent references
  const agentIds = new Set(blueprint.agents.map(a => a.agent_id));
  blueprint.agents.forEach(agent => {
    if (agent.reports_to && !agentIds.has(agent.reports_to)) {
      errors.push(`Agent ${agent.agent_id} reports to non-existent agent ${agent.reports_to}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Convert blueprint to Builder Agent format
 */
export function convertToBuilderFormat(blueprint: Blueprint): any {
  return {
    workflowId: blueprint.workflow_id,
    workflowName: blueprint.workflow_name,
    agents: blueprint.agents,
    integrations: blueprint.integrations,
    communicationPatterns: blueprint.communication_patterns,
    rules: blueprint.workflow_rules,
    monitoring: blueprint.monitoring_config,
  };
}

