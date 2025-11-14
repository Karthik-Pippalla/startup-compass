const mongoose = require('mongoose');

const AgentRunSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    agent: { type: String, required: true },
    status: {
      type: String,
      enum: ['queued', 'running', 'succeeded', 'failed'],
      default: 'queued',
    },
    startedAt: Date,
    durationMs: Number,
    request: mongoose.Schema.Types.Mixed,
    response: mongoose.Schema.Types.Mixed,
    error: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

module.exports = mongoose.model('AgentRun', AgentRunSchema);
