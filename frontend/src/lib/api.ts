import type { CollabrationRecord, CollabrationResponse, CreateJobPayload, Job } from '../types/job';

// Ensure base URL always points to the Express '/api' prefix
const RAW_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
const API_BASE_URL = RAW_BASE
  ? (RAW_BASE.endsWith('/api') ? RAW_BASE : `${RAW_BASE}/api`)
  : '/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.message || `Request failed (${response.status})`);
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

export const submitcollabration = async (
  jobId: string,
  payload: { userId: string },
): Promise<CollabrationResponse> => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/collabrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const getCollabrations = async (): Promise<CollabrationRecord[]> => {
  const response = await fetch(`${API_BASE_URL}/jobs/collabrations`);
  return handleResponse(response);
};

export const requestCollabration = async (
  collabrationId: string,
  payload: { userId: string; message?: string },
): Promise<CollabrationRecord> => {
  const response = await fetch(`${API_BASE_URL}/jobs/collabrations/${collabrationId}/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(response);
  return data.collabration;
};
