import type { TimelinePlan } from '../types/job';

type TimelineProps = {
  plan?: TimelinePlan;
};

export const Timeline = ({ plan }: TimelineProps) => {
  if (!plan) {
    return null;
  }

  return (
    <div className="card">
      <h2>Checklist & Timeline</h2>
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
