const AgentRun = require('../../models/AgentRun');
const Job = require('../../models/Job');
const { marketingAgent } = require('./marketingAgent');
const { developerAgent } = require('./developerAgent');
const { fundingAgent } = require('./fundingAgent');
const { competitorAgent } = require('./competitorAgent');
const { checklistAgent } = require('./checklistAgent');

// Agent execution timeout (ms)
const AGENT_TIMEOUT_MS = parseInt(process.env.AGENT_TIMEOUT_MS || '45000', 10);

// Debug helpers
const ts = () => new Date().toISOString();
const safeStringify = (obj, max = 5000) => {
  try {
    const s = JSON.stringify(obj, null, 2);
    return s.length > max ? s.slice(0, max) + '... <truncated>' : s;
  } catch (e) {
    return String(obj);
  }
};
const debug = (...args) => console.log(`[${ts()}]`, ...args);

const resolveJobId = (jobLike) => {
  if (!jobLike) return null;
  if (typeof jobLike === 'string') return jobLike;
  if (jobLike.id) return jobLike.id;
  if (jobLike._id && typeof jobLike._id.toString === 'function') {
    return jobLike._id.toString();
  }
  return null;
};

// Helper to wrap a promise with a timeout
const withTimeout = (promise, ms, agentName) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${agentName} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const STRATEGY_AGENTS = [
  marketingAgent,
  developerAgent,
  fundingAgent,
  competitorAgent,
  checklistAgent,
];

const updateAgentOutputs = async (jobRef, agentName, partial) => {
  const jobId = resolveJobId(jobRef);
  if (!jobId) {
    throw new Error('Unable to update agent outputs without a job id');
  }
  const record = {
    agent: agentName,
    status: partial.status,
  };
  if (partial.payload !== undefined) record.payload = partial.payload;
  if (partial.error !== undefined) record.error = partial.error;
  if (partial.startedAt !== undefined) record.startedAt = partial.startedAt;
  if (partial.finishedAt !== undefined) record.finishedAt = partial.finishedAt;

  const result = await Job.updateOne(
    { _id: jobId, 'agentOutputs.agent': agentName },
    { $set: { 'agentOutputs.$': record } }
  );

  const matched = typeof result.matchedCount === 'number'
    ? result.matchedCount
    : (typeof result.n === 'number' ? result.n : 0);
  if (matched === 0) {
    await Job.updateOne(
      { _id: jobId },
      { $push: { agentOutputs: record } }
    );
  }

  debug('updateAgentOutputs()', { jobId, agent: agentName, status: partial.status, hasPayload: !!partial.payload });
};

// Update signature to accept jobDoc and an optional context payload for the agent
const runAgentWithLogging = async (jobDoc, agentInstance, agentContext) => {
  const jobId = resolveJobId(jobDoc);
  if (!jobId) {
    throw new Error('Cannot run agent without job reference');
  }
  const label = `agent:${agentInstance.name} job:${jobId}`;
  debug('Starting agent', { agent: agentInstance.name, jobId, timeoutMs: AGENT_TIMEOUT_MS });
  if (agentContext?.specificPrompt) {
    debug('Agent specificPrompt present', { agent: agentInstance.name, promptChars: String(agentContext.specificPrompt).length });
  }

  console.time(label);
  const run = await AgentRun.create({
    jobId: jobId,
    agent: agentInstance.name,
    status: 'running',
    startedAt: new Date(),
  });

  const startedAt = new Date();

  try {
    await updateAgentOutputs(jobId, agentInstance.name, {
      status: 'running',
      startedAt,
    });

    // Timeout-protected execution
    const payload = await withTimeout(
      Promise.resolve(agentInstance.execute(agentContext || (typeof jobDoc.toObject === 'function' ? jobDoc.toObject() : jobDoc))),
      AGENT_TIMEOUT_MS,
      agentInstance.name
    );

    debug('Agent payload received', { agent: agentInstance.name, jobId, payloadPreview: safeStringify(payload, 1200) });

    const finishedAt = new Date();
    await updateAgentOutputs(jobId, agentInstance.name, {
      status: 'succeeded',
      payload,
      startedAt,
      finishedAt,
    });

    run.status = 'succeeded';
    run.durationMs = finishedAt.getTime() - startedAt.getTime();
    run.response = payload;
    await run.save();

    console.timeEnd(label);
    debug('Agent finished', { agent: agentInstance.name, jobId, durationMs: run.durationMs });
    return payload;
  } catch (error) {
    console.timeEnd(label);
    debug('Agent failed', { agent: agentInstance.name, jobId, error: error?.message || String(error) });

    await updateAgentOutputs(jobId, agentInstance.name, {
      status: 'failed',
      error: error.message || error,
      startedAt,
      finishedAt: new Date(),
    });

    run.status = 'failed';
    run.error = { message: error.message };
    await run.save();

    throw error;
  }
};

const runStrategicAgents = async (jobId) => {
  const job = typeof jobId === 'string' ? await Job.findById(jobId) : jobId;
  if (!job) {
    throw new Error('Job not found');
  }

  job.status = 'running';
  job.history.push({ message: 'Started downstream agents with enhanced validation prompts' });
  await job.save();

  // Separate core agents from checklist agent (checklist depends on other outputs)
  const coreAgents = STRATEGY_AGENTS.filter(agent => agent.name !== 'checklist');
  const checklistAgentInstance = STRATEGY_AGENTS.find(agent => agent.name === 'checklist');

  debug('Dispatching core agents in parallel', { jobId: job.id || job._id?.toString?.(), agents: coreAgents.map(a => a.name) });

  const baseAgentContext = job.toObject();

  // Run core agents in parallel
  const dispatchStarted = Date.now();
  const agentPromises = coreAgents.map(agent => {
    const contextForAgent = {
      ...baseAgentContext,
      specificPrompt: job.agentPrompts?.[agent.name] || job.agentPrompts?.technical || null,
    };
    debug('Queueing agent', { agent: agent.name, promptChars: contextForAgent.specificPrompt ? String(contextForAgent.specificPrompt).length : 0 });
    // Always return a settled promise (success or failure) to allow waiting for all
    return runAgentWithLogging(job, agent, contextForAgent)
      .then((payload) => ({ agent: agent.name, status: 'succeeded', payload }))
      .catch((err) => ({ agent: agent.name, status: 'failed', error: err?.message || String(err) }));
  });

  // Wait for all core agents to settle (no early short-circuit)
  const results = await Promise.all(agentPromises);
  debug('Core agents settled', { elapsedMs: Date.now() - dispatchStarted, results: results.map(r => ({ agent: r.agent, status: r.status })) });

  // Log each agent output fully (truncated for safety)
  results.forEach(r => {
    if (r.status === 'succeeded') {
      debug(`[AGENT OUTPUT] ${r.agent}`, safeStringify(r.payload, 4000));
    } else {
      debug(`[AGENT ERROR] ${r.agent}`, r.error);
    }
  });

  // Run checklist agent after core agents complete (it needs their outputs)
  if (checklistAgentInstance) {
    debug('Running checklist agent after core agents completion');
    const updatedJob = await Job.findById(job.id);
    const contextForChecklist = {
      ...updatedJob.toObject(),
      specificPrompt: updatedJob.agentPrompts?.checklist || null,
    };
    const checklistPayload = await runAgentWithLogging(updatedJob, checklistAgentInstance, contextForChecklist)
      .catch((err) => {
        debug('Checklist agent failed', { error: err?.message || String(err) });
        return null;
      });
    if (checklistPayload) {
      debug('[AGENT OUTPUT] checklist', safeStringify(checklistPayload, 4000));
      updatedJob.timeline = checklistPayload;
      await updatedJob.save();
    }
  }

  // Mark job as completed
  const finalJob = await Job.findById(job.id);
  finalJob.status = 'completed';
  finalJob.history.push({ message: 'All agents finished (see logs for outputs)' });
  await finalJob.save();
  debug('Job completed', { jobId: finalJob.id || finalJob._id?.toString?.(), status: finalJob.status });

  return finalJob;
};

module.exports = { runStrategicAgents, runAgentWithLogging };
