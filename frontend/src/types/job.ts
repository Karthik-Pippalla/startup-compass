export type JobStatus =
  | 'pending'
  | 'collecting_info'
  | 'ready'
  | 'running'
  | 'completed'
  | 'failed';

export type QuestionType = 'text' | 'textarea' | 'select' | 'tags' | 'number';

export interface QuestionnaireQuestion {
  key: string;
  label: string;
  helpText?: string;
  type?: QuestionType;
  options?: { label: string; value: string }[];
}

export interface Questionnaire {
  questions: QuestionnaireQuestion[];
  answers: Record<string, string>;
}

export interface AgentOutput {
  agent: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed';
  payload?: Record<string, unknown>;
  error?: unknown;
  startedAt?: string;
  finishedAt?: string;
}

export interface TimelinePhase {
  phase: string;
  tasks: string[];
  durationWeeks?: number;
}

export interface TimelinePlan {
  phases: TimelinePhase[];
  notes?: Record<string, unknown>;
}

export interface Job {
  _id: string;
  status: JobStatus;
  originalPrompt: { summary: string };
  validatedBrief: Record<string, unknown>;
  questionnaire: Questionnaire;
  missingFields: string[];
  agentOutputs: AgentOutput[];
  timeline?: TimelinePlan;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobPayload {
  prompt: string;
  metadata?: Record<string, unknown>;
  brief?: Record<string, unknown>;
}
