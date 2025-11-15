const normalize = (value) => (typeof value === 'string' ? value.trim() : '');

const selectPrompt = (jobContext = {}, fallbackPrompt) => {
  const forwarded = normalize(jobContext?.specificPrompt);
  if (forwarded) return forwarded;

  const fallback = normalize(fallbackPrompt);
  if (fallback) return fallback;

  const original = jobContext?.originalPrompt;
  if (typeof original === 'string') {
    const trimmed = normalize(original);
    if (trimmed) return trimmed;
  }

  if (original && typeof original.summary === 'string') {
    const summary = normalize(original.summary);
    if (summary) return summary;
  }

  if (original && typeof original.prompt === 'string') {
    const prompt = normalize(original.prompt);
    if (prompt) return prompt;
  }

  return '';
};

module.exports = { selectPrompt };
