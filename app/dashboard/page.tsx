'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

interface Stats {
  totalWorkflows: number;
  activeAgents: number;
  systemStatus: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalWorkflows: 0,
    activeAgents: 0,
    systemStatus: 'Online'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      // Get user data from token
      fetchUserData();
      
      // Fetch workflows
      fetchWorkflows();
      setLoading(false);
    }
  }, [router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Fallback to decoding token
        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ 
              name: payload.name || payload.email?.split('@')[0] || 'User', 
              email: payload.email 
            });
          } catch {
            setUser({ name: 'User', email: 'user@example.com' });
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUser({ name: 'User', email: 'user@example.com' });
    }
  };

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
        setStats({
          totalWorkflows: data.workflows?.length || 0,
          activeAgents: data.workflows?.filter((w: Workflow) => w.status === 'active').length || 0,
          systemStatus: 'Online'
        });
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  const handleWorkflowClick = async (workflowId: string) => {
    try {
      console.log('🔄 Navigating to workflow:', workflowId);
      
      // Find the workflow to get its session ID
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) {
        console.error('Workflow not found:', workflowId);
        return;
      }

      // Get the session ID for this workflow
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/workflows/${workflowId}/session`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const sessionId = data.sessionId;
        
        console.log('✅ Found session ID:', sessionId);
        
        // Navigate to workflow page with session ID
        router.push(`/workflow/${workflowId}?session=${sessionId}`);
      } else {
        console.error('Failed to get session for workflow');
        // Fallback: navigate to new workflow page
        router.push('/workflow/new');
      }
    } catch (error) {
      console.error('Error navigating to workflow:', error);
      // Fallback: navigate to new workflow page
      router.push('/workflow/new');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="welcome-title">Welcome, {user.name}</h1>
          <p className="welcome-subtitle">Ready to build your AI workforce?</p>
        </div>
        <div className="header-right">
          <button className="header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </button>
          <button className="header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </button>
          <button className="header-icon profile-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalWorkflows}</div>
            <div className="stat-label">Total Workflows</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeAgents}</div>
            <div className="stat-label">Active Agents</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.systemStatus}</div>
            <div className="stat-label">System Status</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {workflows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
            </div>
            <h2 className="empty-title">No Workflows Yet</h2>
            <p className="empty-description">
              Create your first AI workflow to get started with AgentFlow PRO
            </p>
          </div>
        ) : (
          <div className="workflows-grid">
            {workflows.map((workflow) => (
              <div 
                key={workflow.id} 
                className="workflow-card clickable"
                onClick={() => handleWorkflowClick(workflow.id)}
              >
                <div className="workflow-header">
                  <h3 className="workflow-name">{workflow.name}</h3>
                  <span className={`workflow-status ${workflow.status.toLowerCase()}`}>
                    {workflow.status}
                  </span>
                </div>
                <p className="workflow-description">{workflow.description}</p>
                <div className="workflow-footer">
                  <span className="workflow-date">
                    Created {new Date(workflow.createdAt).toLocaleDateString()}
                  </span>
                  <div className="workflow-actions">
                    <span className="workflow-action-text">
                      {workflow.status === 'DRAFT' ? 'Continue Design' : 'View Details'}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Workflow Button */}
        <div className="cta-section">
          <Link href="/workflow/new" className="create-workflow-btn">
            <div className="btn-content">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span>Create New Workflow</span>
            </div>
            <div className="btn-glow"></div>
          </Link>
        </div>
      </div>
    </div>
  );
}

