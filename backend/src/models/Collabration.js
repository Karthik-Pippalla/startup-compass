const mongoose = require('mongoose');

const collabrationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalPrompt: String,
    validatedBrief: mongoose.Schema.Types.Mixed,
    agentOutputs: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    timeline: mongoose.Schema.Types.Mixed,
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

collabrationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Collabration', collabrationSchema);
