import { useEffect, useState } from 'react';
import './App.css';
import { AgentOutputs } from './components/AgentOutputs';
import { Timeline } from './components/Timeline';
import { createJob, getJob, submitAnswers } from './lib/api';
import type { Job } from './types/job';

type Message = {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

function App() {
  const [job, setJob] = useState<Job | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');

  // Add welcome message on first load
  useEffect(() => {
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
  }, [messages.length]);

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const nextJob = await getJob(jobId);
        setJob(nextJob);
        
        // Check if questionnaire is needed
        if (nextJob.status === 'collecting_info' && nextJob.questionnaire?.questions?.length > 0) {
          setShowQuestionnaire(true);
        }
        
        // Update messages based on job status
        updateMessagesBasedOnJobStatus(nextJob);
      } catch (err) {
        console.error(err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [jobId, messages]);

  const updateMessagesBasedOnJobStatus = (currentJob: Job) => {
    if (currentJob.status === 'running' && !messages.some(m => m.content.includes('analyzing your idea'))) {
      addMessage('assistant', '🚀 Great! I\'m now analyzing your idea with my team of specialized agents. This will take a moment...');
    } else if (currentJob.status === 'completed' && !messages.some(m => m.content.includes('analysis complete'))) {
      addMessage('assistant', '✅ Analysis complete! Here are the insights from our marketing, development, funding, and competitor analysis agents:');
    }
  };

  const addMessage = (type: 'user' | 'assistant' | 'system', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handlePromptSubmit = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    // Add user message
    addMessage('user', prompt);
    setIsLoading(true);
    setError(null);
    
    try {
      const newJob = await createJob({ prompt, brief: {} });
      setJob(newJob);
      setJobId(newJob._id);
      
      // Add assistant response
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

  // Show landing page if no job has been started
  if (!jobId) {
    return (
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
    );
  }

  return (
    <div className="chat-app">
      <header className="chat-header">
        <div>
          <h1>🧭 Startup Compass</h1>
          <p>AI-powered startup validation and planning</p>
        </div>
      </header>

      <div className="chat-container">
        {/* Chat Messages */}
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

        {/* Chat Input */}
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
                placeholder="Continue the conversation..."
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
      </div>

      {/* Questionnaire Modal */}
      {showQuestionnaire && job?.questionnaire?.questions && (
        <div className="modal-overlay" onClick={() => setShowQuestionnaire(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🤔 I need some more details</h2>
              <p>Your idea sounds interesting! To provide you with the most accurate analysis, I need a few more details:</p>
              <button 
                className="modal-close" 
                onClick={() => setShowQuestionnaire(false)}
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
                        <span className="required">*</span>
                      </span>
                      {question.type === 'textarea' ? (
                        <textarea
                          name={question.key}
                          className="modal-textarea"
                          placeholder={question.helpText || ''}
                          required
                        />
                      ) : (
                        <input
                          name={question.key}
                          type={question.type === 'number' ? 'number' : 'text'}
                          className="modal-input"
                          placeholder={question.helpText || ''}
                          required
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
                  onClick={() => setShowQuestionnaire(false)}
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

      {/* Results Section - Only show when job is completed */}
      {job?.status === 'completed' && (
        <div className="results-section">
          <div className="results-grid">
            <div className="timeline-section">
              <Timeline plan={job?.timeline} />
            </div>
            <div className="agents-section">
              <AgentOutputs outputs={job?.agentOutputs || []} />
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-toast">{error}</div>}
    </div>
  );
}

export default App;
