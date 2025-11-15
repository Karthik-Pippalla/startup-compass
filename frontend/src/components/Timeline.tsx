import type { TimelinePlan } from '../types/job';

type TimelineProps = {
  plan?: TimelinePlan;
  title?: string | null;
};

export const Timeline = ({ plan, title = 'Checklist & Timeline' }: TimelineProps) => {
  if (!plan) {
    return null;
  }

  return (
    <div className="card timeline-card">
      {title ? <h2>{title}</h2> : null}
      <ol className="timeline">
        {plan.phases.map((phase) => (
          <li key={phase.phase}>
            <div className="timeline-header">
              <strong>{phase.phase}</strong>
              {phase.durationWeeks ? <span>{phase.durationWeeks} wks</span> : null}
            </div>
            <ul>
              {phase.tasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
};
