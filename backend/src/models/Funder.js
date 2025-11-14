const mongoose = require('mongoose');

const FunderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contact: {
      email: String,
      website: String,
      phone: String,
    },
    ticketSize: {
      min: Number,
      max: Number,
    },
    stageFocus: [{ type: String }],
    geography: [{ type: String }],
    keywords: [{ type: String, index: true }],
    notes: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model('Funder', FunderSchema);
