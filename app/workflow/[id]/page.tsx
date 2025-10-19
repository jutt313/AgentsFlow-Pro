'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DesignerChat from '@/app/components/DesignerChat';
import WorkflowDiagram from '@/app/components/WorkflowDiagram';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function WorkflowPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);
  const [workflowData, setWorkflowData] = useState<any>(null);

  // Load existing session
  useEffect(() => {
    if (sessionId) {
      loadExistingSession();
    } else {
      // No session ID, redirect to new workflow
      router.push('/workflow/new');
    }
  }, [sessionId, router]);

  const loadExistingSession = async () => {
    try {
      console.log('🔄 Loading existing session:', sessionId);
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/workflows/${params.id}/session`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Session data loaded:', data);
        
        setWorkflowData(data);
        
        // Load conversation history
        if (data.conversationState?.messages) {
          const loadedMessages = data.conversationState.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(loadedMessages);
        }
        
        // Load blueprint if exists
        if (data.blueprint) {
          setBlueprint(data.blueprint);
          setShowDiagram(true);
        } else if (data.teamDesign) {
          setBlueprint(data.teamDesign);
          setShowDiagram(true);
        }
        
        // Show diagram if in design stage or later
        if (data.stage && ['design', 'credentials', 'approval', 'complete'].includes(data.stage)) {
          setShowDiagram(true);
        }
        
        console.log('✅ Session loaded successfully');
      } else {
        console.error('Failed to load session');
        router.push('/workflow/new');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      router.push('/workflow/new');
    }
  };

  const handleSendMessage = async (content: string) => {
    console.log('💬 Frontend - User sending message:', content);
    console.log('🆔 Current session ID:', sessionId);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    console.log('👤 Adding user message to UI:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      console.log('🔑 Token exists:', !!token);
      
      console.log('📤 Sending request to API...');
      const response = await fetch('/api/agents/designer/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          message: content,
        }),
      });

      console.log('📥 API response status:', response.status);
      console.log('📥 API response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API response data:', data);
        
        // Add assistant response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || data.response,
          timestamp: new Date(),
        };
        
        console.log('🤖 Adding assistant message to UI:', assistantMessage);
        setMessages(prev => [...prev, assistantMessage]);

        // Show diagram when we move to design stage
        if (data.stage && ['design', 'credentials', 'approval'].includes(data.stage)) {
          console.log('📊 Moving to design stage, showing diagram');
          setShowDiagram(true);
        }

        // Update blueprint if provided
        if (data.teamDesign || data.blueprint) {
          console.log('📋 Updating blueprint:', data.blueprint || data.teamDesign);
          setBlueprint(data.blueprint || data.teamDesign);
        }
      } else {
        const error = await response.json();
        console.error('❌ API error response:', error);
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.error || 'Unknown error'}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered a network error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      console.log('✅ Message handling complete, stopping loading');
      setIsLoading(false);
    }
  };

  if (!sessionId) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="workflow-page">
      {/* Header */}
      <div className="workflow-header">
        <button onClick={() => router.push('/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
        <h1 className="workflow-title">
          {workflowData?.stage ? `Workflow: ${workflowData.stage}` : 'Continue Workflow'}
        </h1>
        <div className="workflow-status">
          {sessionId && <span className="status-badge">Session Active</span>}
        </div>
      </div>

      {/* Main Content */}
      <div className={`workflow-content ${showDiagram ? 'split-view' : 'center-view'}`}>
        {/* Chat Section */}
        <div className="chat-section">
          <DesignerChat
            sessionId={sessionId}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        {/* Diagram Section */}
        {showDiagram && (
          <div className="diagram-section">
            <WorkflowDiagram 
              blueprint={blueprint}
              isBuilding={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
