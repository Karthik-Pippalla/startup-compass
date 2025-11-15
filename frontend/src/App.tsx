import { useEffect, useState } from 'react';
import './App.css';
import { AgentOutputs } from './components/AgentOutputs';
import { Timeline } from './components/Timeline';
import { createJob, getJob, submitAnswers, submitcollabration, getCollabrations, requestCollabration } from './lib/api';
import type { Job, CollabrationRecord, CollabrationOwner, AgentOutput } from './types/job';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/AuthPage';
import { User, LogOut } from 'lucide-react';

type Message = {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

const JOB_STATUS_LABELS: Record<string, string> = {
  collecting_info: 'Collecting info',
  running: 'Analyzing',
  completed: 'Complete',
  pending: 'Pending',
  failed: 'Failed',
};

const AGENT_STATUS_LABELS: Record<AgentOutput['status'], string> = {
  pending: 'Pending',
  running: 'Running...',
  succeeded: 'Complete',
  failed: 'Failed',
};

const AGENT_STATUS_ICONS: Record<AgentOutput['status'], string> = {
  pending: '⏳',
  running: '🔄',
  succeeded: '✅',
  failed: '❌',
};

function App() {
  const { user, userProfile, loading, logout } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [questionnaireDismissed, setQuestionnaireDismissed] = useState(false);
  const [statusAnnouncements, setStatusAnnouncements] = useState({ running: false, completed: false });
  const [isSubmittingcollabration, setIsSubmittingcollabration] = useState(false);
  const [collabrationSubmitted, setcollabrationSubmitted] = useState(false);
  const [showCollabrationsModal, setShowCollabrationsModal] = useState(false);
  const [collabrations, setCollabrations] = useState<CollabrationRecord[]>([]);
  const [collabrationsLoading, setCollabrationsLoading] = useState(false);
  const [collabrationsError, setCollabrationsError] = useState<string | null>(null);
  const [requestingCollabId, setRequestingCollabId] = useState<string | null>(null);
  const [requestSuccessId, setRequestSuccessId] = useState<string | null>(null);
  const filteredAgentOutputs = job?.agentOutputs?.filter((output) => output.agent !== 'checklist') ?? [];
  const checklistOutput = job?.agentOutputs?.find((output) => output.agent === 'checklist') || null;
  const hasTimeline = Boolean(job?.timeline?.phases?.length);

  // Welcome message effect (runs once when authenticated)
  useEffect(() => {
    if (loading) return; // avoid during initial loading
    if (!user || !userProfile) return; // only once authenticated
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'assistant',
        content: `Hi! I'm your Startup Compass assistant. 🚀

I'll help you validate your startup idea and create a comprehensive plan by:
• 🎯 **Marketing Analysis** - Target audience and positioning strategy
• 💻 **Technical Planning** - Development roadmap and tech stack
• 💰 **Funding Opportunities** - Matching you with relevant investors
• 📊 **Competitor Analysis** - Market insights and differentiation
• ✅ **Project Timeline** - Step-by-step execution plan

Just describe your startup idea and I'll get started!

**Example prompts:**
• "I want to build an AI-powered fitness app for busy professionals"
• "My idea is a sustainable packaging solution for e-commerce businesses"
• "I'm creating a fintech platform to help small businesses manage cash flow"`,
        timestamp: new Date()
      }]);
    }
  }, [loading, user, userProfile, messages.length]);

  // Polling effect (only when a job is active & authenticated)
  useEffect(() => {
    if (!user || !userProfile) return;
    if (!jobId) return;

    const getPollingInterval = (jobStatus: string) => {
      if (jobStatus === 'running') return 1500;
      if (jobStatus === 'collecting_info') return 2000;
      return 4000;
    };

    let cancelled = false;
    const poll = async () => {
      try {
        const nextJob = await getJob(jobId);
        if (cancelled) return;
        setJob(nextJob);
        if (
          nextJob.status === 'collecting_info' &&
          nextJob.questionnaire?.questions?.length > 0 &&
          !showQuestionnaire &&
          !questionnaireDismissed
        ) {
          setShowQuestionnaire(true);
        }
        updateMessagesBasedOnJobStatus(nextJob);
        const nextInterval = getPollingInterval(nextJob.status);
        setTimeout(poll, nextInterval);
      } catch (err) {
        if (cancelled) return;
        setTimeout(poll, 5000);
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [user, userProfile, jobId, messages, showQuestionnaire, questionnaireDismissed]);

  // Clear session state on logout
  useEffect(() => {
    if (!user) {
      setJob(null);
      setJobId(null);
      setMessages([]);
      setShowQuestionnaire(false);
      setError(null);
      setInputMessage('');
      setStatusAnnouncements({ running: false, completed: false });
    }
  }, [user]);

  useEffect(() => {
    setStatusAnnouncements({ running: false, completed: false });
    setcollabrationSubmitted(false);
    setIsSubmittingcollabration(false);
  }, [jobId]);

  const updateMessagesBasedOnJobStatus = (currentJob: Job) => {
    if (currentJob.status === 'running' && !statusAnnouncements.running) {
      addMessage('assistant', '🚀 Great! I\'m now analyzing your idea with my specialized AI agents running in parallel:\n\n📈 **Marketing Agent** - Analyzing market positioning and go-to-market strategy\n💻 **Technical Agent** - Planning architecture and development roadmap\n💰 **Funding Agent** - Matching with relevant investors\n🏆 **Competitor Agent** - Researching competitive landscape\n\nResults will appear below as each agent completes its analysis...');
      setStatusAnnouncements((prev) => ({ ...prev, running: true }));
    } else if (currentJob.status === 'completed' && !statusAnnouncements.completed) {
      addMessage('assistant', '✅ **Analysis Complete!** All agents have finished their analysis. You can see the detailed insights from each agent below. The final checklist agent has also created a comprehensive project timeline based on all the findings.');
      setStatusAnnouncements((prev) => ({ ...prev, completed: true }));
    }
  };

  const addMessage = (type: 'user' | 'assistant' | 'system', content: string) => {
    const newMessage: Message = { id: Date.now().toString(), type, content, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
  };

  const handlePromptSubmit = async (prompt: string) => {
    if (!prompt.trim()) return;
    addMessage('user', prompt);
    setIsLoading(true);
    setError(null);
    try {
      const newJob = await createJob({ prompt, brief: {} });
      setJob(newJob);
      setJobId(newJob._id);
      setcollabrationSubmitted(false);
      addMessage('assistant', 'Let me validate your idea and see if I need any additional information...');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process your request';
      setError(message);
      addMessage('assistant', `Sorry, I encountered an error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionnaireSubmit = async (answers: Record<string, string>) => {
    if (!jobId) return;
    try {
      const updated = await submitAnswers(jobId, answers);
      setJob(updated);
      setShowQuestionnaire(false);
      addMessage('assistant', 'Thank you for the additional information! Now let me run the full analysis...');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit answers';
      setError(message);
      addMessage('assistant', `Sorry, I encountered an error: ${message}`);
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      handlePromptSubmit(inputMessage);
      setInputMessage('');
    }
  };

  const handlecollabrationSubmit = async () => {
    if (!jobId || !userProfile?.id) return;
    setIsSubmittingcollabration(true);
    setError(null);
    try {
      const response = await submitcollabration(jobId, { userId: userProfile.id });
      setcollabrationSubmitted(true);
      if (!response.alreadySubmitted) {
        addMessage('assistant', '🙌 Thanks! Your analysis has been saved as a community collabration.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit collabration';
      setError(message);
    } finally {
      setIsSubmittingcollabration(false);
    }
  };

  const fetchCollabrations = async () => {
    setCollabrationsLoading(true);
    setCollabrationsError(null);
    try {
      const data = await getCollabrations();
      setCollabrations(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load collabrations';
      setCollabrationsError(message);
    } finally {
      setCollabrationsLoading(false);
    }
  };

  const handleCollabrationPanelOpen = async () => {
    setShowCollabrationsModal(true);
    if (collabrations.length === 0 && !collabrationsLoading) {
      fetchCollabrations();
    }
  };

  const closeCollabrationsModal = () => {
    setShowCollabrationsModal(false);
    setRequestSuccessId(null);
    setRequestingCollabId(null);
  };

  const resolveOwnerName = (owner?: CollabrationOwner | string) => {
    if (!owner) return 'Founder';
    if (typeof owner === 'string') return 'Founder';
    const composed = `${owner.firstName || ''} ${owner.lastName || ''}`.trim();
    return owner.displayName || composed || 'Founder';
  };

  const collabrationModal = showCollabrationsModal ? (
    <div className="modal-overlay" onClick={closeCollabrationsModal}>
      <div className="collabration-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Community Collabrations</h2>
          <p>See how other founders described their ideas and the insights they received.</p>
          <button 
            className="modal-close" 
            onClick={closeCollabrationsModal}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="collabration-content">
          {collabrationsLoading && <div className="collabration-loading">Loading collabrations...</div>}
          {collabrationsError && <div className="collabration-error">{collabrationsError}</div>}
          {!collabrationsLoading && !collabrationsError && (
            <div className="collabration-grid">
              {collabrations.length === 0 && (
                <div className="collabration-empty">No collabrations yet. Submit yours to inspire others!</div>
              )}
              {collabrations.map((entry) => {
                const owner = typeof entry.userId === 'object' ? entry.userId as CollabrationOwner : undefined;
                const agentCount = entry.agentOutputs?.length || 0;
                return (
                  <div key={entry._id} className="collabration-card">
                    <div className="collabration-card-header">
                      <div>
                        <p className="eyebrow">Founder</p>
                        <h3>{resolveOwnerName(owner)}</h3>
                        <p className="collabration-contact">
                          {owner?.email || 'No email provided'}
                          {owner?.phoneNumber ? ` • ${owner.phoneNumber}` : ''}
                        </p>
                      </div>
                      <span className="collabration-date">{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="collabration-body">
                      <p className="collabration-prompt">{entry.originalPrompt || 'No prompt provided'}</p>
                      <div className="collabration-meta">
                        <span>{agentCount} agent insights</span>
                        {entry.timeline?.phases && <span>{entry.timeline.phases.length} timeline phases</span>}
                      </div>
                    </div>
                    <div className="collabration-actions">
                      <button
                        type="button"
                        className="collabrate-button"
                        onClick={async () => {
                          if (!userProfile?.id) return;
                          setRequestingCollabId(entry._id);
                          setRequestSuccessId(null);
                          try {
                            await requestCollabration(entry._id, { userId: userProfile.id });
                            setRequestSuccessId(entry._id);
                            fetchCollabrations();
                          } catch (err) {
                            const message = err instanceof Error ? err.message : 'Failed to send collabration request';
                            setCollabrationsError(message);
                          } finally {
                            setRequestingCollabId(null);
                          }
                        }}
                        disabled={requestingCollabId === entry._id || (typeof entry.userId === 'object' && (entry.userId as CollabrationOwner)?._id === userProfile?.id)}
                      >
                        {requestingCollabId === entry._id ? 'Sending...' : 'Request Collabration'}
                      </button>
                      {requestSuccessId === entry._id && (
                        <span className="collabration-requested">Request sent!</span>
                      )}
                    </div>
                    {agentCount > 0 && (
                      <div className="collabration-agents">
                        {entry.agentOutputs.slice(0, 3).map((agent) => (
                          <div key={agent.agent} className="collabration-agent-pill">
                            <strong>{agent.agent}</strong>
                            <span>{agent.status}</span>
                          </div>
                        ))}
                        {agentCount > 3 && (
                          <div className="collabration-agent-pill">+{agentCount - 3} more</div>
                        )}
                      </div>
                    )}
                    {typeof entry.userId === 'object' && (entry.userId as CollabrationOwner)?._id === userProfile?.id && entry.requests?.length ? (
                      <div className="collabration-requests">
                        <p className="collabration-request-title">Collabration Requests</p>
                        <ul>
                          {entry.requests.map((req) => (
                            <li key={req.createdAt}>
                              <strong>{req.requesterName || 'Founder'}</strong> - {req.requesterEmail || 'No email'}
                              <span>{new Date(req.createdAt).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  // After hooks: conditional rendering
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #7c3aed 50%, #ea580c 100%)' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return <AuthPage key="auth" defaultView="login" />;
  }

  // Show landing page if no job has been started
  if (!jobId) {
    return (
      <>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #7c3aed 50%, #ea580c 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: 'white',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {/* User Header */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '2rem',
          padding: '0.5rem 1rem',
        }}>
          <button
            onClick={handleCollabrationPanelOpen}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '1rem',
              padding: '0.35rem 0.85rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Collabration
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} />
            <span style={{ fontSize: '0.9rem' }}>{userProfile.firstName}</span>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'rgba(239, 68, 68, 0.8)',
              border: 'none',
              borderRadius: '1rem',
              padding: '0.5rem 1rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
        
        <div style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #60a5fa, #a78bfa, #fb7185)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Build something Remarkable
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.8, lineHeight: 1.6 }}>
            Hi! I'm your Startup Compass assistant. Describe your startup idea and I'll help you validate it, 
            create a business plan, find relevant funders, analyze competitors, and build a project timeline.
          </p>
        </div>
        
        <form onSubmit={handleInputSubmit} style={{ width: '100%', maxWidth: '600px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '1rem',
            padding: '1rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Describe your startup idea..."
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: '1rem',
                padding: '0.5rem'
              }}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              style={{
                background: inputMessage.trim() ? 'linear-gradient(45deg, #3b82f6, #8b5cf6)' : 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.75rem 1.5rem',
                color: 'white',
                fontWeight: '600',
                cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                opacity: inputMessage.trim() ? 1 : 0.5
              }}
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
      {collabrationModal}
      </>
    );
  }

  return (
    <div className="chat-app">
      <div className="chat-background-glow" aria-hidden="true" />
      <header className="chat-header glass-panel">
        <div>
          <p className="eyebrow">Startup Compass</p>
          <h1>Build something remarkable</h1>
          <p>AI-powered startup validation and planning</p>
        </div>
        <div className="session-actions">
          <button
            type="button"
            className="collabrate-link"
            onClick={handleCollabrationPanelOpen}
          >
            Collaboration
          </button>
          <div className="user-pill">
            <User size={20} />
            <span>{userProfile.firstName}</span>
          </div>
          <button
            onClick={logout}
            className="logout-button"
            type="button"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <div className="chat-layout">
        <section className="chat-panel glass-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Conversation</p>
              <h2>Idea Workshop</h2>
            </div>
            {job?.status && (
              <span className={`status-chip status-${job.status}`}>
                {JOB_STATUS_LABELS[job.status] || job.status.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <div className="chat-messages">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-container">
            <form onSubmit={handleInputSubmit} className="chat-input-form">
              <div className="chat-input-wrapper">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleInputSubmit(e);
                    }
                  }}
                  placeholder="Describe your next move..."
                  disabled={isLoading}
                  className="chat-input"
                  rows={1}
                />
                <button 
                  type="submit" 
                  disabled={!inputMessage.trim() || isLoading}
                  className="chat-send-button"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </section>

        {job && jobId && (
          <section className="agent-panel glass-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Specialist Agents</p>
                <h2>Insight Board</h2>
              </div>
              <p className="panel-subtitle">
                Insights stream in live as each agent shares results.
              </p>
            </div>

            {filteredAgentOutputs.length ? (
              <AgentOutputs outputs={filteredAgentOutputs} />
            ) : (
              <div className="panel-placeholder">
                <p>The marketing, product, funding, and competitor agents will populate here once your idea is processing.</p>
              </div>
            )}

            {hasTimeline && (
              <div className="timeline-shell">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Execution Plan</p>
                    <h2>Checklist & Timeline</h2>
                  </div>
                  {checklistOutput && (
                    <div className={`status-badge status-${checklistOutput.status}`}>
                      <span className="status-icon">{AGENT_STATUS_ICONS[checklistOutput.status]}</span>
                      <span className="status-text">{AGENT_STATUS_LABELS[checklistOutput.status]}</span>
                    </div>
                  )}
                </div>
                <Timeline plan={job.timeline} title={null} />
              </div>
            )}

            {job.status === 'completed' && (
              <div className="collabration-section">
                {collabrationSubmitted ? (
                  <div className="collabration-success">
                    ✅ Your collabration has been captured. Thank you for sharing your insights!
                  </div>
                ) : (
                  <button
                    type="button"
                    className="collabration-button"
                    onClick={handlecollabrationSubmit}
                    disabled={isSubmittingcollabration || !userProfile?.id}
                  >
                    {isSubmittingcollabration ? 'Submitting...' : 'Submit for Collabration'}
                  </button>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Questionnaire Modal */}
      {showQuestionnaire && job?.questionnaire?.questions && (
        <div className="modal-overlay" onClick={() => { setShowQuestionnaire(false); setQuestionnaireDismissed(true); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🤔 I need some more details</h2>
              <p>Your idea sounds interesting! To provide you with the most accurate analysis, I need a few more details:</p>
              <button 
                className="modal-close" 
                onClick={() => { setShowQuestionnaire(false); setQuestionnaireDismissed(true); }}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const answers: Record<string, string> = {};
              job.questionnaire?.questions?.forEach(q => {
                const value = formData.get(q.key);
                if (value) answers[q.key] = value.toString();
              });
              handleQuestionnaireSubmit(answers);
            }} className="modal-form">
              <div className="modal-questions">
                {job.questionnaire.questions.map((question) => (
                  <div key={question.key} className="modal-field">
                    <label className="modal-label">
                      <span className="modal-label-text">
                        {question.label}
                        {/* removed required star; questions are optional */}
                      </span>
                      {question.type === 'textarea' ? (
                        <textarea
                          name={question.key}
                          className="modal-textarea"
                          placeholder={question.helpText || ''}
                          /* optional: no required */
                        />
                      ) : (
                        <input
                          name={question.key}
                          type={question.type === 'number' ? 'number' : 'text'}
                          className="modal-input"
                          placeholder={question.helpText || ''}
                          /* optional: no required */
                        />
                      )}
                      {question.helpText && (
                        <span className="modal-help-text">{question.helpText}</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => { setShowQuestionnaire(false); setQuestionnaireDismissed(true); }}
                  className="modal-button modal-button-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="modal-button modal-button-primary"
                >
                  Continue Analysis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {collabrationModal}

      {error && <div className="error-toast">{error}</div>}
    </div>
  );
}

export default App;
