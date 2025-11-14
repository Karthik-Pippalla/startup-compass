const AgentRun = require('../../models/AgentRun');
const Job = require('../../models/Job');
const { marketingAgent } = require('./marketingAgent');
const { developerAgent } = require('./developerAgent');
const { fundingAgent } = require('./fundingAgent');
const { competitorAgent } = require('./competitorAgent');
const { checklistAgent } = require('./checklistAgent');

const STRATEGY_AGENTS = [
  marketingAgent,
  developerAgent,
  fundingAgent,
  competitorAgent,
  checklistAgent,
];

const updateAgentOutputs = (job, agentName, partial) => {
  const outputs = job.agentOutputs || [];
  const otherOutputs = outputs.filter((item) => item.agent !== agentName);
  const merged = {
    agent: agentName,
    status: partial.status,
    payload: partial.payload,
    error: partial.error,
    startedAt: partial.startedAt,
    finishedAt: partial.finishedAt,
  };
  job.agentOutputs = [...otherOutputs, merged];
  job.markModified('agentOutputs');
};

const runAgentWithLogging = async (job, agentInstance) => {
  const run = await AgentRun.create({
    jobId: job.id,
    agent: agentInstance.name,
    status: 'running',
    startedAt: new Date(),
  });

  const startedAt = new Date();

  try {
    updateAgentOutputs(job, agentInstance.name, {
      status: 'running',
      startedAt,
    });
    await job.save();

    const payload = await agentInstance.execute(job);

    const finishedAt = new Date();
    updateAgentOutputs(job, agentInstance.name, {
      status: 'succeeded',
      payload,
      startedAt,
      finishedAt,
    });
    await job.save();

    run.status = 'succeeded';
    run.durationMs = finishedAt.getTime() - startedAt.getTime();
    run.response = payload;
    await run.save();

    return payload;
  } catch (error) {
    updateAgentOutputs(job, agentInstance.name, {
      status: 'failed',
      error: error.message || error,
      startedAt,
      finishedAt: new Date(),
    });
    await job.save();

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
  job.history.push({ message: 'Started downstream agents' });
  await job.save();

  for (const agent of STRATEGY_AGENTS) {
    // eslint-disable-next-line no-console
    console.log(`Running agent: ${agent.name}`);
    // eslint-disable-next-line no-await-in-loop
    const payload = await runAgentWithLogging(job, agent);
    if (agent.name === 'checklist') {
      job.timeline = payload;
    }
  }

  job.status = 'completed';
  job.history.push({ message: 'Agents finished successfully' });
  await job.save();

  return job;
};

module.exports = { runStrategicAgents, runAgentWithLogging };
