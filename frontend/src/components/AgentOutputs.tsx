import type { AgentOutput } from '../types/job';

type AgentOutputsProps = {
  outputs: AgentOutput[];
};

const statusLabel: Record<AgentOutput['status'], string> = {
  pending: 'Pending',
  running: 'Running',
  succeeded: 'Ready',
  failed: 'Failed',
};

export const AgentOutputs = ({ outputs }: AgentOutputsProps) => {
  if (!outputs.length) {
    return null;
  }

  return (
    <div className="card">
      <h2>Agent outputs</h2>
      <div className="agent-grid">
        {outputs.map((output) => (
          <article className="agent" key={output.agent}>
            <header>
              <strong>{output.agent}</strong>
              <span className={`badge badge-${output.status}`}>{statusLabel[output.status]}</span>
            </header>
            <pre>{JSON.stringify(output.payload ?? output.error ?? {}, null, 2)}</pre>
          </article>
        ))}
      </div>
    </div>
  );
};
