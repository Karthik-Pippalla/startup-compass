import type { AgentOutput } from '../types/job';

type AgentOutputsProps = {
  outputs: AgentOutput[];
};

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
  checklist: '✅',
};

const formatAgentOutput = (agent: string, payload: any) => {
  if (!payload) return null;

  switch (agent) {
    case 'marketing':
      return (
        <div className="marketing-output">
          <div className="section">
            <h4>🎯 Market Positioning</h4>
            <p>{payload.narrative}</p>
          </div>
          {payload.targetMarket && (
            <div className="section">
              <h4>🌍 Target Market</h4>
              <p><strong>{payload.targetMarket}</strong> ({payload.launchScope})</p>
            </div>
          )}
          <div className="section">
            <h4>👥 Demographics</h4>
            {payload.demographics?.map((demo: any, index: number) => (
              <div key={index} className="demographic-item">
                <strong>{demo.segment}</strong>: {demo.painPoint}
              </div>
            ))}
          </div>
          <div className="section">
            <h4>📢 Acquisition Channels</h4>
            <ul>
              {payload.acquisitionChannels?.map((channel: string, index: number) => (
                <li key={index}>{channel}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    
    case 'developer':
      return (
        <div className="developer-output">
          <div className="section">
            <h4>🛠️ Tech Stack</h4>
            <div className="tech-stack">
              <div><strong>Frontend:</strong> {payload.stack?.frontend}</div>
              <div><strong>Backend:</strong> {payload.stack?.backend}</div>
              <div><strong>Database:</strong> {payload.stack?.database}</div>
              <div><strong>Hosting:</strong> {payload.stack?.hosting}</div>
            </div>
            {payload.stack?.recommendation && (
              <div className="recommendation">
                <strong>💡 Recommendation:</strong> {payload.stack.recommendation}
              </div>
            )}
          </div>
          <div className="section">
            <h4>📅 Delivery Plan</h4>
            <div className="milestones">
              {payload.deliveryPlan?.map((milestone: any, index: number) => (
                <div key={index} className="milestone">
                  <strong>{milestone.name}</strong> - {milestone.durationWeeks} weeks
                </div>
              ))}
            </div>
          </div>
          <div className="section">
            <h4>⚠️ Risks</h4>
            <ul>
              {payload.risks?.map((risk: string, index: number) => (
                <li key={index}>{risk}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    
    case 'funding':
      return (
        <div className="funding-output">
          {payload.matches?.length > 0 ? (
            <div className="section">
              <h4>🎯 Matched Funders</h4>
              {payload.matches.map((funder: any, index: number) => (
                <div key={index} className="funder-match">
                  <div className="funder-header">
                    <strong>{funder.name}</strong>
                    <span className="score">Score: {Math.round(funder.score * 100)}%</span>
                  </div>
                  <div className="funder-details">
                    <div><strong>Stage:</strong> {funder.stageFocus}</div>
                    <div><strong>Geography:</strong> {funder.geography}</div>
                    <div><strong>Contact:</strong> {funder.contact}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="section">
              <h4>📝 Note</h4>
              <p>{payload.note}</p>
              <div className="keywords">
                <strong>Keywords analyzed:</strong> {payload.keywords?.join(', ')}
              </div>
            </div>
          )}
        </div>
      );
    
    case 'competitor':
      return (
        <div className="competitor-output">
          <div className="section">
            <h4>🏢 Market Analysis</h4>
            <p><strong>Industry:</strong> {payload.industry}</p>
            <p><strong>Analysis Scope:</strong> {payload.analysisDepth}</p>
          </div>
          <div className="section">
            <h4>🏆 Key Competitors</h4>
            {payload.competitors?.map((competitor: any, index: number) => (
              <div key={index} className="competitor-item">
                <div className="competitor-header">
                  <strong>{competitor.name}</strong>
                  {competitor.region && <span className="region">({competitor.region})</span>}
                </div>
                <div><strong>Differentiator:</strong> {competitor.differentiator}</div>
                <div><strong>Pricing:</strong> {competitor.pricing}</div>
              </div>
            ))}
          </div>
          <div className="section">
            <h4>📊 Monitoring Plan</h4>
            <ul>
              {payload.monitoringPlan?.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    
    case 'checklist':
      return (
        <div className="checklist-output">
          <div className="section">
            <h4>📋 Project Phases</h4>
            {payload.phases?.map((phase: any, index: number) => (
              <div key={index} className="phase">
                <div className="phase-header">
                  <strong>{phase.phase}</strong>
                  <span className="duration">{phase.durationWeeks} weeks</span>
                </div>
                <ul className="tasks">
                  {phase.tasks?.map((task: string, taskIndex: number) => (
                    <li key={taskIndex}>{task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );
    
    default:
      return <pre>{JSON.stringify(payload, null, 2)}</pre>;
  }
};

export const AgentOutputs = ({ outputs }: AgentOutputsProps) => {
  if (!outputs.length) {
    return null;
  }

  // Sort outputs to show completed ones first, then running, then pending
  const sortedOutputs = [...outputs].sort((a, b) => {
    const statusOrder = { succeeded: 0, running: 1, failed: 2, pending: 3 };
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
