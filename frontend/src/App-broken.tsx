import { useEffect, useState } from 'react';
import './App.css';
import { LandingPage } from './components/LandingPage';
import { ChatInterface } from './components/ChatInterface';
import { QuestionnaireModal } from './components/QuestionnaireModal';
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
  }, [jobId]);

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

  // Show landing page if no job has been started
  if (!jobId) {
    return <LandingPage onStartChat={handlePromptSubmit} />;
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
          <ChatInterface 
            onSubmit={handlePromptSubmit} 
            disabled={isLoading}
            placeholder="Describe your startup idea..."
          />
        </div>
      </div>

      {/* Questionnaire Modal */}
      {showQuestionnaire && (
        <QuestionnaireModal
          questions={job?.questionnaire?.questions || []}
          onSubmit={handleQuestionnaireSubmit}
          onClose={() => setShowQuestionnaire(false)}
        />
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
