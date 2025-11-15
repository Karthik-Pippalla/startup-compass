import type { CreateJobPayload, Job } from '../types/job';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.message || 'Request failed');
    throw error;
  }
  return response.json();
};

export const createJob = async (payload: CreateJobPayload): Promise<Job> => {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const getJob = async (jobId: string): Promise<Job> => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
  return handleResponse(response);
};

export const submitAnswers = async (
  jobId: string,
  answers: Record<string, unknown>,
): Promise<Job> => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  return handleResponse(response);
};
