import type { ReactNode } from 'react';
import type { AgentOutput } from '../types/job';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const stringify = (value: unknown): string => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const getRawPayload = (payload?: Record<string, unknown>): unknown => {
  if (!payload) return undefined;
  if ('raw' in payload) {
    return (payload as { raw?: unknown }).raw;
  }
  return payload;
};

const getPayloadError = (payload?: Record<string, unknown>): unknown => {
  if (!payload) return undefined;
  return (payload as { error?: unknown }).error;
};

const renderRawBlock = (raw: unknown): ReactNode => {
  if (raw === undefined || raw === null) {
    return <p className="raw-placeholder">No raw output provided.</p>;
  }
  if (typeof raw === 'string') {
    return <pre className="raw-output-block">{raw}</pre>;
  }
  if (typeof raw === 'number' || typeof raw === 'boolean') {
    return <pre className="raw-output-block">{String(raw)}</pre>;
  }
  if (isRecord(raw) || Array.isArray(raw)) {
    return <pre className="raw-output-block">{JSON.stringify(raw, null, 2)}</pre>;
  }
  return <pre className="raw-output-block">{String(raw)}</pre>;
};

type AgentOutputsProps = {
  outputs: AgentOutput[];
};

const AGENT_ORDER = ['competitor', 'developer', 'funding', 'marketing'];

const statusLabel: Record<AgentOutput['status'], string> = {
  pending: 'Pending',
  running: 'Running...',
  succeeded: 'Complete',
  failed: 'Failed',
};

const statusIcon: Record<AgentOutput['status'], string> = {
  pending: '⏳',
  running: '🔄',
  succeeded: '✅',
  failed: '❌',
};

const agentIcons: Record<string, string> = {
  marketing: '📈',
  developer: '💻',
  funding: '💰',
  competitor: '🏆',
};

const formatAgentOutput = (_agent: string, payload: Record<string, unknown> | undefined): ReactNode => {
  if (!payload) {
    return <p className="raw-placeholder">No data yet.</p>;
  }

  const raw = getRawPayload(payload);
  const error = getPayloadError(payload);
  const hasError = error !== undefined && error !== null;

  return (
    <div className="raw-output-wrapper">
      {renderRawBlock(raw)}
      {hasError && (
        <div className="raw-error">
          <strong>Error from workflow:</strong>
          <pre>{stringify(error)}</pre>
        </div>
      )}
    </div>
  );
};

export const AgentOutputs = ({ outputs }: AgentOutputsProps) => {
  if (!outputs.length) {
    return null;
  }

  const statusOrder = { succeeded: 0, running: 1, pending: 2, failed: 3 };
  const getOrderIndex = (agent: string) => {
    const idx = AGENT_ORDER.indexOf(agent);
    return idx === -1 ? AGENT_ORDER.length + 1 : idx;
  };

  const sortedOutputs = [...outputs].sort((a, b) => {
    const agentDiff = getOrderIndex(a.agent) - getOrderIndex(b.agent);
    if (agentDiff !== 0) return agentDiff;
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="agent-outputs-container">
      <h2>🤖 AI Agent Analysis</h2>
      <p className="subtitle">Each agent analyzes different aspects of your startup in parallel</p>

      <div className="agents-grid">
        {sortedOutputs.map((output) => (
          <div
            key={output.agent}
            className={`agent-card agent-${output.agent} status-${output.status}`}
          >
            <div className="agent-header">
              <div className="agent-title">
                <span className="agent-icon">{agentIcons[output.agent] || '🔧'}</span>
                <h3>{output.agent.charAt(0).toUpperCase() + output.agent.slice(1)} Agent</h3>
              </div>
              <div className={`status-badge status-${output.status}`}>
                <span className="status-icon">{statusIcon[output.status]}</span>
                <span className="status-text">{statusLabel[output.status]}</span>
              </div>
            </div>

            <div className="agent-content">
              {output.status === 'succeeded' && formatAgentOutput(output.agent, output.payload)}
              {output.status === 'running' && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Analyzing your startup...</p>
                </div>
              )}
              {output.status === 'failed' && (
                <div className="error-state">
                  <p>❌ Analysis failed</p>
                  <details>
                    <summary>Error details</summary>
                    <pre>{JSON.stringify(output.error, null, 2)}</pre>
                  </details>
                </div>
              )}
              {output.status === 'pending' && (
                <div className="pending-state">
                  <p>⏳ Waiting to start analysis...</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
