import type { AgentOutput } from '../types/job';

// Helper renderers for dynamic objects from workflows
const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const renderKV = (obj?: Record<string, unknown>) => {
  if (!isObject(obj)) return null;
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined && v !== null);
  if (!entries.length) return null;
  return (
    <div className="kv-list">
      {entries.map(([k, v]) => (
        <div key={k} className="kv-row">
          <strong>{k.replace(/_/g, ' ')}:</strong>{' '}
          {isObject(v) ? JSON.stringify(v, null, 2) : Array.isArray(v) ? (v as unknown[]).join(', ') : String(v)}
        </div>
      ))}
    </div>
  );
};

type AgentOutputsProps = {
  outputs: AgentOutput[];
};

const AGENT_ORDER = ['competitor', 'checklist', 'developer', 'funding', 'marketing'];

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

          {/* Structured Profiles per schema */}
          {(payload.demographicProfile || payload.demographics) && (
            <div className="section">
              <h4>👥 Demographic Profile</h4>
              {renderKV(payload.demographicProfile || payload.demographics)}
            </div>
          )}
          {payload.behavioralProfile && (
            <div className="section">
              <h4>🧠 Behavioral Profile</h4>
              {renderKV(payload.behavioralProfile)}
            </div>
          )}
          {payload.psychographicProfile && (
            <div className="section">
              <h4>💡 Psychographic Profile</h4>
              {renderKV(payload.psychographicProfile)}
            </div>
          )}
        </div>
      );
    
    case 'developer':
      return (
        <div className="developer-output">
          <div className="section">
            <h4>🛠️ Tech Stack (Categories)</h4>
            <div className="tech-stack">
              <div><strong>Frontend:</strong> {(payload.frontendTechnologies || []).join(', ') || '—'}</div>
              <div><strong>Backend:</strong> {(payload.backendTechnologies || []).join(', ') || '—'}</div>
              <div><strong>SQL DB:</strong> {(payload.sqlDatabases || []).join(', ') || '—'}</div>
              <div><strong>NoSQL DB:</strong> {(payload.noSqlDatabases || []).join(', ') || '—'}</div>
              <div><strong>Auth:</strong> {(payload.authenticationAndAuthorization || []).join(', ') || '—'}</div>
              <div><strong>DevOps:</strong> {(payload.devOpsAndDeployment || []).join(', ') || '—'}</div>
              <div><strong>APIs & Integrations:</strong> {(payload.apisAndIntegrations || []).join(', ') || '—'}</div>
              <div><strong>AI / ML:</strong> {(payload.aiOrMl || []).join(', ') || '—'}</div>
              <div><strong>Cloud:</strong> {(payload.cloudServices || []).join(', ') || '—'}</div>
              <div><strong>Enhancements:</strong> {(payload.optionalEnhancements || []).join(', ') || '—'}</div>
            </div>
            {payload.stack?.legacy && (
              <div className="recommendation"><strong>Legacy Stack Fields:</strong> {JSON.stringify(payload.stack.legacy)}</div>
            )}
            {payload.technologyPreference && (
              <p className="note"><strong>Preference:</strong> {payload.technologyPreference}</p>
            )}
            {payload.visionSentence && (
              <p className="note"><strong>Vision:</strong> {payload.visionSentence}</p>
            )}
          </div>
          {Array.isArray(payload.apiDesign) && payload.apiDesign.length > 0 && (
            <div className="section">
              <h4>🧩 API Design</h4>
              <ul>
                {payload.apiDesign.map((ep: any, i: number) => (
                  <li key={i}>{ep.name || ep.title || `Endpoint ${i+1}`}</li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(payload.deliveryPlan) && payload.deliveryPlan.length > 0 && (
            <div className="section">
              <h4>📅 Delivery Plan</h4>
              <div className="milestones">
                {payload.deliveryPlan.map((milestone: any, index: number) => (
                  <div key={index} className="milestone">
                    <strong>{milestone.name || milestone.title || milestone.phase || `Phase ${index+1}`}</strong>{' '}
                    {milestone.durationWeeks && `- ${milestone.durationWeeks} wks`}
                  </div>
                ))}
              </div>
            </div>
          )}
          {!!payload.risks?.length && (
            <div className="section">
              <h4>⚠️ Risks</h4>
              <ul>
                {payload.risks?.map((risk: string, index: number) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    
    case 'funding':
      return (
        <div className="funding-output">
          {payload.matches?.length > 0 && (
            <div className="section">
              <h4>🎯 Matched Funders</h4>
              {payload.matches.map((funder: any, index: number) => (
                <div key={index} className="funder-match">
                  <div className="funder-header">
                    <strong>{funder.name}</strong>
                    {typeof funder.score === 'number' && (
                      <span className="score">Score: {Math.round(funder.score * 100)}%</span>
                    )}
                  </div>
                  <div className="funder-details">
                    <div><strong>Stage:</strong> {Array.isArray(funder.stageFocus) ? funder.stageFocus.join(', ') : funder.stageFocus}</div>
                    <div><strong>Geography:</strong> {Array.isArray(funder.geography) ? funder.geography.join(', ') : funder.geography}</div>
                    <div><strong>Contact:</strong> {isObject(funder.contact) ? JSON.stringify(funder.contact) : funder.contact}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {payload.executiveSummary && (
            <div className="section">
              <h4>📝 Executive Summary</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{payload.executiveSummary}</p>
            </div>
          )}

          {Array.isArray(payload.immediateOpportunities) && payload.immediateOpportunities.length > 0 && (
            <div className="section">
              <h4>⏱️ Immediate Opportunities</h4>
              <ul>
                {payload.immediateOpportunities.map((item: string, i: number) => (<li key={i}>{item}</li>))}
              </ul>
            </div>
          )}

          {Array.isArray(payload.rollingOpportunities) && payload.rollingOpportunities.length > 0 && (
            <div className="section">
              <h4>🔁 Rolling Opportunities</h4>
              <ul>
                {payload.rollingOpportunities.map((item: string, i: number) => (<li key={i}>{item}</li>))}
              </ul>
            </div>
          )}

          {Array.isArray(payload.recommendedNextSteps) && payload.recommendedNextSteps.length > 0 && (
            <div className="section">
              <h4>✅ Recommended Next Steps</h4>
              <ul>
                {payload.recommendedNextSteps.map((item: string, i: number) => (<li key={i}>{item}</li>))}
              </ul>
            </div>
          )}

          {(payload.keywords?.length > 0) && (
            <div className="section">
              <h4>🔎 Keywords</h4>
              <div className="keywords"><strong>Keywords analyzed:</strong> {payload.keywords.join(', ')}</div>
            </div>
          )}
        </div>
      );
    
    case 'competitor':
      return (
        <div className="competitor-output">
          <div className="section">
            <h4>🏢 Market Analysis</h4>
            <p><strong>Industry:</strong> {payload.industry || '—'}</p>
            <p><strong>Analysis Scope:</strong> {payload.analysisScope || payload.analysisDepth || payload.competitorScope || '—'}</p>
            {payload.marketAnalysisRegion && (
              <p><strong>Focus:</strong> {payload.marketAnalysisRegion}</p>
            )}
          </div>
          <div className="section">
            <h4>🏆 Key Competitors</h4>
            {payload.competitors?.map((competitor: any, index: number) => (
              <div key={index} className="competitor-item">
                <div className="competitor-header">
                  <strong>{competitor.name}</strong>
                  {competitor.region && <span className="region">({competitor.region})</span>}
                </div>
                {competitor.differentiator && <div><strong>Differentiator:</strong> {competitor.differentiator}</div>}
                {competitor.pricing && <div><strong>Pricing:</strong> {competitor.pricing}</div>}
              </div>
            ))}
          </div>
          {Array.isArray(payload.pricingModels) && payload.pricingModels.length > 0 && (
            <div className="section">
              <h4>💵 Pricing Models</h4>
              <ul>
                {payload.pricingModels.map((item: any, i: number) => (<li key={i}>{isObject(item) ? JSON.stringify(item) : String(item)}</li>))}
              </ul>
            </div>
          )}
          {payload.positioning && (
            <div className="section">
              <h4>🎯 Positioning</h4>
              <div>{isObject(payload.positioning) ? JSON.stringify(payload.positioning) : String(payload.positioning)}</div>
            </div>
          )}
          {payload.differentiation && (
            <div className="section">
              <h4>✨ Differentiation</h4>
              <div>{isObject(payload.differentiation) ? JSON.stringify(payload.differentiation) : String(payload.differentiation)}</div>
            </div>
          )}
          {Array.isArray(payload.threatAssessment) && payload.threatAssessment.length > 0 && (
            <div className="section">
              <h4>⚠️ Threat Assessment</h4>
              <ul>
                {payload.threatAssessment.map((item: any, i: number) => (<li key={i}>{isObject(item) ? JSON.stringify(item) : String(item)}</li>))}
              </ul>
            </div>
          )}
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

  const statusOrder = { succeeded: 0, running: 1, pending: 2, failed: 3 };
  const getOrderIndex = (agent: string) => {
    const idx = AGENT_ORDER.indexOf(agent);
    return idx === -1 ? AGENT_ORDER.length + 1 : idx;
  };

  // Sort outputs in a deterministic layout order for the dashboard
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
