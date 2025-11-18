import type { ReactNode } from 'react';
import type {
  AgentOutput,
  AgentPayload,
  DemographicChart,
  DemographicChartSegment,
  HumanizedAgentSummary,
} from '../types/job';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const AGENT_MODEL_LABELS: Record<string, string> = {
  marketing: 'Code Preview Search 4o',
  developer: 'GPT-5',
  funding: 'GPT-5',
};

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

const getHumanizedPayload = (payload?: Record<string, unknown>): HumanizedAgentSummary | undefined => {
  if (!payload) return undefined;
  const humanized = (payload as { humanized?: HumanizedAgentSummary }).humanized;
  if (!humanized) return undefined;

  const normalizeList = (items?: string[]) =>
    Array.isArray(items) ? items.map((item) => item?.trim()).filter((item): item is string => !!item) : undefined;

  const summary = typeof humanized.summary === 'string' ? humanized.summary.trim() : '';
  const highlights = normalizeList(humanized.highlights);
  const recommendations = normalizeList(humanized.recommendations);
  const nextSteps = normalizeList(humanized.nextSteps);

  if (!summary && !highlights?.length && !recommendations?.length && !nextSteps?.length) {
    return undefined;
  }

  return {
    summary,
    highlights,
    recommendations,
    nextSteps,
    model: humanized.model,
    generatedAt: humanized.generatedAt,
  };
};

const formatDate = (value?: string) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const renderHumanizedSection = (title: string, items?: string[]) => {
  if (!items || items.length === 0) {
    return null;
  }
  return (
    <div className="humanized-section">
      <h4>{title}</h4>
      <ul>
        {items.map((item, idx) => (
          <li key={`${title}-${idx}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

const renderHumanizedBlock = (agent: string, humanized: HumanizedAgentSummary) => {
  const agentLabel = agent ? agent.charAt(0).toUpperCase() + agent.slice(1) : 'Agent';
  const normalizedAgent = agent.toLowerCase();
  const modelLabel = AGENT_MODEL_LABELS[normalizedAgent] || humanized.model;
  const metaParts = [modelLabel ? `Model: ${modelLabel}` : null, humanized.generatedAt ? formatDate(humanized.generatedAt) : null].filter(
    Boolean
  );

  return (
    <div className="humanized-block">
      <div className="humanized-heading">
        <span>AI summary for {agentLabel}</span>
        {metaParts.length > 0 && <span className="humanized-meta">{metaParts.join(' • ')}</span>}
      </div>
      {humanized.summary && <p className="humanized-summary">{humanized.summary}</p>}
      {renderHumanizedSection('Highlights', humanized.highlights)}
      {renderHumanizedSection('Recommendations', humanized.recommendations)}
      {renderHumanizedSection('Next steps', humanized.nextSteps)}
    </div>
  );
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

const PIE_COLORS = ['#60a5fa', '#f472b6', '#34d399', '#facc15', '#a855f7', '#fb923c'];

type DemographicChartEntry = DemographicChart & { key: string };
type DecoratedSegment = DemographicChartSegment & { percent: number; color: string };

const isDemographicChartSegment = (segment: unknown): segment is DemographicChartSegment =>
  !!segment &&
  typeof segment === 'object' &&
  typeof (segment as DemographicChartSegment).label === 'string' &&
  Number.isFinite((segment as DemographicChartSegment).value);

const isDemographicChart = (chart: unknown): chart is DemographicChart =>
  !!chart &&
  typeof chart === 'object' &&
  typeof (chart as DemographicChart).title === 'string' &&
  (chart as DemographicChart).type &&
  ['pie', 'bar'].includes((chart as DemographicChart).type) &&
  Array.isArray((chart as DemographicChart).segments) &&
  (chart as DemographicChart).segments.every(isDemographicChartSegment);

const getMarketingDemographicDetails = (payload?: AgentPayload) => {
  if (!payload) return null;
  const summary =
    typeof payload.demographicSummary === 'string' ? payload.demographicSummary.trim() : undefined;
  const persona =
    typeof payload.demographicPersona === 'string' ? payload.demographicPersona.trim() : undefined;

  const chartsObject = payload.demographicCharts;
  const charts: DemographicChartEntry[] = [];
  if (chartsObject && typeof chartsObject === 'object') {
    Object.entries(chartsObject).forEach(([key, chart]) => {
      if (isDemographicChart(chart) && chart.segments.length) {
        charts.push({
          ...chart,
          key,
        });
      }
    });
  }

  if (!charts.length && !summary && !persona) {
    return null;
  }

  return {
    summary,
    persona,
    charts,
  };
};

const decoratePieSegments = (segments: DemographicChartSegment[]): DecoratedSegment[] => {
  const total =
    segments.reduce((acc, segment) => acc + Math.max(segment.value, 0), 0) || segments.length || 1;
  return segments.map((segment, index) => {
    const percent = Math.round((Math.max(segment.value, 0) / total) * 1000) / 10;
    return {
      ...segment,
      percent: Number.isFinite(percent) ? percent : 0,
      color: PIE_COLORS[index % PIE_COLORS.length],
    };
  });
};

const decorateBarSegments = (segments: DemographicChartSegment[]): DecoratedSegment[] => {
  const max =
    segments.reduce((acc, segment) => Math.max(acc, Math.max(segment.value, 0)), 0) || 1;
  return segments.map((segment, index) => {
    const percentage = Math.round((Math.max(segment.value, 0) / max) * 1000) / 10;
    return {
      ...segment,
      percent: Number.isFinite(percentage) ? percentage : 0,
      color: PIE_COLORS[index % PIE_COLORS.length],
    };
  });
};

const formatChartValue = (segment: DemographicChartSegment, metric?: string) => {
  if (typeof segment.formattedValue === 'string' && segment.formattedValue.trim()) {
    return segment.formattedValue;
  }
  if (metric === 'count') {
    return new Intl.NumberFormat().format(Math.round(segment.value));
  }
  return `${Math.round(segment.value * 10) / 10}%`;
};

const PieChart = ({ segments }: { segments: DemographicChartSegment[] }) => {
  if (!segments.length) return null;
  const decorated = decoratePieSegments(segments);
  let start = 0;
  const gradientParts = decorated.map((segment) => {
    const end = start + segment.percent;
    const part = `${segment.color} ${start}% ${end}%`;
    start = end;
    return part;
  });
  const gradient =
    gradientParts.length > 0 ? gradientParts.join(', ') : '#94a3b8 0% 100%';

  return (
    <div className="pie-chart">
      <div className="pie-chart-graphic" style={{ backgroundImage: `conic-gradient(${gradient})` }} />
      <ul className="chart-legend">
        {decorated.map((segment) => (
          <li key={segment.label}>
            <span className="legend-color" style={{ backgroundColor: segment.color }} />
            <div className="legend-text">
              <strong>{segment.label}</strong>
              <span>{segment.formattedValue || `${segment.percent}%`}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const BarChart = ({
  segments,
  metric,
}: {
  segments: DemographicChartSegment[];
  metric?: string;
}) => {
  if (!segments.length) return null;
  const decorated = decorateBarSegments(segments);
  return (
    <div className="bar-chart">
      {decorated.map((segment) => (
        <div key={segment.label} className="bar-row">
          <span className="bar-label">{segment.label}</span>
          <div className="bar-track">
            <span
              className="bar-fill"
              style={{ width: `${Math.min(segment.percent, 100)}%`, backgroundColor: segment.color }}
            ></span>
          </div>
          <span className="bar-value">{formatChartValue(segment, metric)}</span>
        </div>
      ))}
    </div>
  );
};

const MarketingDemographics = ({ payload }: { payload?: AgentPayload }) => {
  const details = getMarketingDemographicDetails(payload);
  if (!details) return null;
  return (
    <div className="marketing-demographics">
      {(details.persona || details.summary) && (
        <div className="demographic-summary">
          {details.persona && (
            <p className="persona-label">
              Primary Persona: <strong>{details.persona}</strong>
            </p>
          )}
          {details.summary && <p>{details.summary}</p>}
        </div>
      )}
      {details.charts.length > 0 && (
        <div className="demographic-charts">
          {details.charts.map((chart) => (
            <div key={chart.key} className="chart-card">
              <div className="chart-header">
                <div>
                  <h4>{chart.title}</h4>
                  {chart.description && <p>{chart.description}</p>}
                </div>
                <span className="chart-metric">{chart.metric === 'count' ? 'Users' : '%'}</span>
              </div>
              {chart.type === 'pie' ? (
                <PieChart segments={chart.segments} />
              ) : (
                <BarChart segments={chart.segments} metric={chart.metric} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

type AgentOutputsProps = {
  outputs: AgentOutput[];
};

const AGENT_ORDER = ['marketing', 'developer', 'funding'];
const HIDDEN_AGENTS = new Set(['competitor']);

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
};

const formatAgentOutput = (_agent: string, payload: AgentPayload | undefined): ReactNode => {
  if (!payload) {
    return <p className="raw-placeholder">No data yet.</p>;
  }

  const raw = getRawPayload(payload);
  const error = getPayloadError(payload);
  const humanized = getHumanizedPayload(payload);
  const humanizedError =
    typeof (payload as { humanizedError?: string }).humanizedError === 'string'
      ? (payload as { humanizedError?: string }).humanizedError
      : undefined;
  const hasError = error !== undefined && error !== null;

  return (
    <div className="agent-output-stack">
      {_agent === 'marketing' && <MarketingDemographics payload={payload} />}
      {humanized ? (
        renderHumanizedBlock(_agent, humanized)
      ) : (
        <div className="humanized-placeholder">
          <p>Working on a friendly summary… raw data is still available below.</p>
        </div>
      )}

      {humanizedError && (
        <div className="humanized-error-banner">
          <strong>Summary note:</strong> {humanizedError}
        </div>
      )}

      <details className="raw-output-section">
        <summary>View raw agent output</summary>
        {renderRawBlock(raw)}
      </details>

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
  const visibleOutputs = outputs.filter((output) => !HIDDEN_AGENTS.has(output.agent));
  if (!visibleOutputs.length) {
    return null;
  }

  const statusOrder = { succeeded: 0, running: 1, pending: 2, failed: 3 };
  const getOrderIndex = (agent: string) => {
    const idx = AGENT_ORDER.indexOf(agent);
    return idx === -1 ? AGENT_ORDER.length + 1 : idx;
  };

  const sortedOutputs = [...visibleOutputs].sort((a, b) => {
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
