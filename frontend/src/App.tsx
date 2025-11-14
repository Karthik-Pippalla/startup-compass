import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { PromptForm } from './components/PromptForm';
import { Questionnaire } from './components/Questionnaire';
import { AgentOutputs } from './components/AgentOutputs';
import { Timeline } from './components/Timeline';
import { createJob, getJob, submitAnswers } from './lib/api';
import type { Job } from './types/job';

function App() {
  const [job, setJob] = useState<Job | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const nextJob = await getJob(jobId);
        setJob(nextJob);
      } catch (err) {
        console.error(err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [jobId]);

  const createNewJob = async (payload: Parameters<typeof createJob>[0]) => {
    setIsCreating(true);
    setError(null);
    try {
      const newJob = await createJob(payload);
      setJob(newJob);
      setJobId(newJob._id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create job';
      setError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const submitFollowUp = async (answers: Record<string, string>) => {
    if (!jobId) return;
    try {
      const updated = await submitAnswers(jobId, answers);
      setJob(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      setError(message);
    }
  };

  const statusLabel = useMemo(() => {
    if (!job) return 'No job yet';
    switch (job.status) {
      case 'collecting_info':
        return 'Need more context';
      case 'ready':
        return 'Validated – waiting on agents';
      case 'running':
        return 'Agents running';
      case 'completed':
        return 'Plan complete';
      case 'failed':
        return 'Something went wrong';
      default:
        return job.status;
    }
  }, [job]);

  return (
    <div className="layout">
      <header>
        <div>
          <p className="eyebrow">Startup Compass</p>
          <h1>Multi-agent launcher</h1>
          <p className="muted">
            Validation asks follow-up questions, then routes the prompt to marketing, developer, funding,
            and competitor agents before handing everything to the checklist timeline.
          </p>
        </div>
        <div className="badge badge-status">{statusLabel}</div>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <section className="grid-2">
        <PromptForm onSubmit={createNewJob} disabled={isCreating} />
        <div className="stack">
          <Questionnaire
            questions={job?.questionnaire?.questions || []}
            onSubmit={submitFollowUp}
            disabled={!jobId}
          />
          <Timeline plan={job?.timeline} />
        </div>
      </section>

      <section>
        <AgentOutputs outputs={job?.agentOutputs || []} />
      </section>
    </div>
  );
}

export default App;
