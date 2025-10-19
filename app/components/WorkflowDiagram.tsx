'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface WorkflowDiagramProps {
  blueprint?: any;
  isBuilding?: boolean;
}

export default function WorkflowDiagram({ blueprint, isBuilding = false }: WorkflowDiagramProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert blueprint to ReactFlow nodes and edges
  useEffect(() => {
    if (!blueprint) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Check if blueprint has reactflow_diagram (new format)
    if (blueprint.reactflow_diagram) {
      // Use the pre-generated diagram from blueprint generator
      blueprint.reactflow_diagram.nodes.forEach((node: any) => {
        newNodes.push({
          id: node.id,
          type: 'default',
          data: { 
            label: (
              <div className="diagram-node" style={{
                backgroundColor: node.data.backgroundColor,
                borderColor: node.data.borderColor,
                color: node.data.color,
                padding: '12px',
                borderRadius: '8px',
                border: `2px solid ${node.data.borderColor}`,
                minWidth: '120px',
                textAlign: 'center'
              }}>
                <div className="node-icon" style={{ fontSize: '24px', marginBottom: '8px' }}>
                  {node.data.icon}
                </div>
                <div className="node-title" style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {node.data.label}
                </div>
                <div className="node-role" style={{ fontSize: '12px', opacity: 0.8 }}>
                  {node.data.role}
                </div>
                {node.data.status && (
                  <div className="node-status" style={{ 
                    fontSize: '10px', 
                    marginTop: '4px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: node.data.status === 'active' ? '#10b981' : '#6b7280',
                    color: 'white'
                  }}>
                    {node.data.status}
                  </div>
                )}
              </div>
            )
          },
          position: node.position,
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: 'transparent',
            border: 'none',
            padding: 0,
          }
        });
      });

      blueprint.reactflow_diagram.edges.forEach((edge: any) => {
        newEdges.push({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type || 'smoothstep',
          animated: edge.animated || false,
          style: edge.style || { stroke: '#6b7280', strokeWidth: 2 },
          label: edge.label,
          labelStyle: edge.labelStyle,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edge.style?.stroke || '#6b7280',
          },
        });
      });
    } else {
      // Fallback to old format for backward compatibility
      // Manager node (if exists)
      if (blueprint.manager) {
        newNodes.push({
          id: 'manager',
          type: 'default',
          data: { 
            label: (
              <div className="diagram-node manager-node">
                <div className="node-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="node-title">{blueprint.manager.name}</div>
                <div className="node-role">Manager</div>
              </div>
            )
          },
          position: { x: 400, y: 50 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: 'transparent',
            border: 'none',
            padding: 0,
          }
        });
      }

      // Agent nodes
      blueprint.agents?.forEach((agent: any, index: number) => {
        const x = 150 + (index * 250);
        const y = blueprint.manager ? 250 : 100;

        newNodes.push({
          id: agent.id,
          type: 'default',
          data: { 
            label: (
              <div className="diagram-node agent-node">
                <div className="node-icon">{getAgentIcon(agent.type)}</div>
                <div className="node-title">{agent.name}</div>
                <div className="node-role">{agent.type}</div>
              </div>
            )
          },
          position: { x, y },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: 'transparent',
            border: 'none',
            padding: 0,
          }
        });

        // Connect to manager if exists
        if (blueprint.manager) {
          newEdges.push({
            id: `manager-${agent.id}`,
            source: 'manager',
            target: agent.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: 'var(--color-primary)', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: 'var(--color-primary)',
            },
          });
        }
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [blueprint, setNodes, setEdges]);

  const getAgentIcon = (type: string): JSX.Element => {
    const icons: Record<string, JSX.Element> = {
      'customer-support': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      ),
      'marketing': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      'inventory': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
      ),
      'analytics': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
      ),
      'content': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      ),
      'sales': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13 12,13H10V11H12C13.1,11 14,10.1 14,9C14,7.9 13.1,7 12,7C10.9,7 10,7.9 10,9H8C8,7.79 9.79,6 12,6C14.21,6 16,7.79 16,9C16,10.19 15.12,11.13 14,11.44V13.44C16.19,13.75 18,15.47 18,17.5C18,19.98 15.98,22 13.5,22C11.02,22 9,19.98 9,17.5H11C11,18.88 12.12,20 13.5,20C14.88,20 16,18.88 16,17.5C16,16.12 14.88,15 13.5,15H7V13H13.5C14.88,13 16,11.88 16,10.5C16,9.12 14.88,8 13.5,8H10V6H13.5C14.88,6 16,4.88 16,3.5C16,2.12 14.88,1 13.5,1C12.12,1 11,2.12 11,3.5H9C9,1.57 10.57,0 12.5,0C14.43,0 16,1.57 16,3.5C16,5.43 14.43,7 12.5,7H7V15Z"/>
        </svg>
      ),
      'operations': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
        </svg>
      ),
      'social-media': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z"/>
        </svg>
      ),
    };
    return icons[type] || (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    );
  };

  return (
    <div className="workflow-diagram-container">
      {!blueprint && (
        <div className="diagram-placeholder">
          <div className="placeholder-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <h3>Workflow Diagram</h3>
          <p>Your AI team structure will appear here as we design it together!</p>
        </div>
      )}

      {blueprint && (
        <>
          {isBuilding && (
            <div className="diagram-building-indicator">
              <div className="building-pulse"></div>
              <span>Building your workflow...</span>
            </div>
          )}
          
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-right"
            className="workflow-reactflow"
          >
            <Background color="rgba(249, 115, 22, 0.1)" gap={16} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </>
      )}
    </div>
  );
}

