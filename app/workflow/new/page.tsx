'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DesignerChat from '@/app/components/DesignerChat';
import WorkflowDiagram from '@/app/components/WorkflowDiagram';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  credentialButtons?: string[];
}

export default function NewWorkflowPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true); // New state for session loading
  const [showDiagram, setShowDiagram] = useState(false);

  // Initialize session
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    setIsSessionLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Get or create a session
      const response = await fetch('/api/agents/designer/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.session) {
          setSessionId(data.session.id);
          // Load existing conversation
          if (data.session.conversationState?.messages) {
            setMessages(data.session.conversationState.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })));
          }
          // Load existing blueprint
          if (data.session.blueprint) {
            setBlueprint(data.session.blueprint);
            setShowDiagram(true);
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
    } finally {
      setIsSessionLoading(false);
    }
  };

  const handleCredentialSubmit = async (platform: string, credentials: Record<string, string>) => {
    console.log('🔑 Frontend - Credential submission:', platform, credentials);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/agents/designer/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          platform,
          credentials,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Credentials saved:', data);
        
        // Add confirmation message
        const confirmationMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ ${platform} credentials saved successfully! Your AI team can now connect to ${platform}.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, confirmationMessage]);

        // Continue the conversation automatically after credentials are saved
        console.log('🔄 Continuing conversation after credential save...');
        setIsLoading(true);
        
        try {
          const continueResponse = await fetch('/api/agents/designer/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              sessionId,
              message: 'Credentials saved, please continue with the workflow design',
            }),
          });

          if (continueResponse.ok) {
            const continueData = await continueResponse.json();
            console.log('✅ Conversation continued:', continueData);
            
            // Add the continued response
            const continuedMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: continueData.message,
              timestamp: new Date(),
              credentialButtons: continueData.credentialButtons,
            };
            setMessages(prev => [...prev, continuedMessage]);

            // Update state if blueprint is complete
            if (continueData.isComplete && continueData.blueprint) {
              setBlueprint(continueData.blueprint);
              setShowDiagram(true);
            }
          } else {
            console.error('❌ Failed to continue conversation');
          }
        } catch (continueError) {
          console.error('❌ Error continuing conversation:', continueError);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.error('❌ Failed to save credentials');
        alert('Failed to save credentials. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error saving credentials:', error);
      alert('Error saving credentials. Please try again.');
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
    setIsSendingMessage(true);

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
          credentialButtons: data.credentialButtons,
        };
        
        console.log('🤖 Adding assistant message to UI:', assistantMessage);
        setMessages(prev => [...prev, assistantMessage]);

        // Update session ID if new
        if (data.sessionId && !sessionId) {
          console.log('🆔 Updating session ID:', data.sessionId);
          setSessionId(data.sessionId);
        }

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
      console.log('✅ Message handling complete, stopping sending indicator');
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="workflow-page">
      {/* Small Back Button */}
      <button 
        onClick={() => router.push('/dashboard')} 
        className="small-back-button"
        title="Back to Dashboard"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>

      {/* Main Content */}
      <div className={`workflow-content ${showDiagram ? 'split-view' : 'center-view'}`}>
        {/* Chat Section */}
        <div className="chat-section">
          <DesignerChat
            sessionId={sessionId}
            messages={messages}
            onSendMessage={handleSendMessage}
            onCredentialSubmit={handleCredentialSubmit}
            isLoading={isSendingMessage}
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

