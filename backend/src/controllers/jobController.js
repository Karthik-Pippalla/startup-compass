const Job = require('../models/Job');
const { validationAgent } = require('../services/agents/validationAgent');
const { runStrategicAgents } = require('../services/agents/orchestrator');

const mapBodyToAnswers = (data = {}) => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const applyValidation = async (job) => {
  const validationResult = await validationAgent.execute(job);
  job.validatedBrief = validationResult.validatedBrief;
  job.questionnaire.questions = validationResult.questions;
  job.missingFields = validationResult.missingFields;
  job.agentPrompts = validationResult.agentPrompts; // Store generated prompts
  job.status =
    validationResult.status === 'complete' ? (job.status === 'running' ? 'running' : 'ready') : 'collecting_info';
  job.history.push({
    message:
      validationResult.status === 'complete'
        ? 'Validation complete - Agent prompts generated'
        : `Validation needs info: ${validationResult.missingFields.join(', ')}`,
  });
  await job.save();
  return validationResult.status;
};

const scheduleAgentPipeline = (jobId) => {
  setImmediate(() => {
    runStrategicAgents(jobId).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Agent pipeline failed', error);
    });
  });
};

const createJob = async (req, res, next) => {
  try {
    const { prompt, metadata, brief } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const answers = mapBodyToAnswers(brief);

    const job = await Job.create({
      originalPrompt: { summary: prompt, metadata },
      validatedBrief: answers,
      questionnaire: {
        answers,
      },
      status: 'pending',
    });

    const validationStatus = await applyValidation(job);

    if (validationStatus === 'complete') {
      scheduleAgentPipeline(job.id);
    }

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
};

const submitAnswers = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const answers = mapBodyToAnswers(req.body.answers);
    const currentAnswers = job.questionnaire.answers || {};
    job.questionnaire.answers = { ...currentAnswers, ...answers };
    job.validatedBrief = { ...job.validatedBrief, ...answers };

    const validationStatus = await applyValidation(job);

    if (validationStatus === 'complete') {
      scheduleAgentPipeline(job.id);
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJob,
  submitAnswers,
};
