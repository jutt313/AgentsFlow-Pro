'use client';

import { useState, useRef, useEffect } from 'react';
import CredentialButton from './CredentialButton';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  credentialButtons?: string[]; // Array of platform names for credential buttons
}

interface DesignerChatProps {
  sessionId: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onCredentialSubmit: (platform: string, credentials: Record<string, string>) => void;
  isLoading?: boolean;
  isSessionLoading?: boolean; // New prop
}

export default function DesignerChat({
  sessionId,
  messages,
  onSendMessage,
  onCredentialSubmit,
  isLoading = false,
  isSessionLoading = false // Default to false
}: DesignerChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* Chat Messages Container */}
      <div className="designer-chat-container">
        {/* Chat Messages */}
        <div className="chat-messages">
        {messages.length === 0 && !isSessionLoading && (
          <div className="chat-welcome">
            <div className="welcome-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
            </div>
            <h3>Hi! I'm your Designer Agent for Automation</h3>
            <p>What do you want to automate? Describe your goal and I'll draft a diagram immediately.</p>
            <div className="welcome-examples" style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
              <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Examples:</p>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.25rem' }}>• "When Shopify order arrives, send Slack notification"</li>
                <li style={{ marginBottom: '0.25rem' }}>• "Every morning, check Gmail and summarize emails"</li>
                <li style={{ marginBottom: '0.25rem' }}>• "When form submitted, validate data and update Airtable"</li>
              </ul>
            </div>
          </div>
        )}          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
            <div className="message-avatar">
              {message.role === 'user' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              )}
            </div>
            <div className="message-content">
              <div className="message-text">
                {message.content}
              </div>
              {message.credentialButtons && message.credentialButtons.length > 0 && (
                <div className="credential-buttons-container">
                  <p className="credential-prompt">Connect your platforms:</p>
                  <div className="credential-buttons">
                    {message.credentialButtons.map((platform) => (
                      <CredentialButton
                        key={platform}
                        platform={platform}
                        onCredentialSubmit={onCredentialSubmit}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="message-time">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            </div>
          ))}
          
        {isLoading && (
          <div className="chat-message assistant-message">
            <div className="message-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar - Outside Chat Container */}
      {!isSessionLoading ? (
        <form onSubmit={handleSubmit} className="chat-input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to automate..."
            className="chat-input"
            rows={1}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            className="chat-send-button"
            disabled={!input.trim() || isLoading}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 10L18 2L10 18L9 11L2 10Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </form>
      ) : (
        <div className="chat-input-container">
          <textarea
            placeholder="Loading session..."
            className="chat-input"
            rows={1}
            disabled={true}
          />
          <button
            type="submit"
            className="chat-send-button"
            disabled={true}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 10L18 2L10 18L9 11L2 10Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      )}    </>
  );
}
