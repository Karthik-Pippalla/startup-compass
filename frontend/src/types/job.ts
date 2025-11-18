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

export interface HumanizedAgentSummary {
  summary?: string;
  highlights?: string[];
  recommendations?: string[];
  nextSteps?: string[];
  model?: string;
  generatedAt?: string;
}

export interface DemographicChartSegment {
  label: string;
  value: number;
  formattedValue?: string;
}

export interface DemographicChart {
  title: string;
  type: 'pie' | 'bar';
  metric?: string;
  description?: string;
  segments: DemographicChartSegment[];
}

export interface AgentPayload extends Record<string, unknown> {
  raw?: unknown;
  humanized?: HumanizedAgentSummary;
  humanizedError?: string;
  demographicSummary?: string;
  demographicPersona?: string;
  demographicCharts?: Record<string, DemographicChart>;
}

export interface AgentOutput {
  agent: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed';
  payload?: AgentPayload;
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

export interface CollabrationOwner {
  _id?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface CollabrationRequest {
  requesterId?: string | CollabrationOwner;
  requesterName?: string;
  requesterEmail?: string;
  message?: string;
  createdAt: string;
}

export interface CollabrationRecord {
  _id: string;
  jobId: string;
  userId: string | CollabrationOwner;
  originalPrompt?: string;
  validatedBrief?: Record<string, unknown>;
  agentOutputs: AgentOutput[];
  timeline?: TimelinePlan;
  createdAt: string;
  updatedAt: string;
  requests?: CollabrationRequest[];
}

export interface CollabrationResponse {
  collabration: CollabrationRecord;
  alreadySubmitted: boolean;
}
