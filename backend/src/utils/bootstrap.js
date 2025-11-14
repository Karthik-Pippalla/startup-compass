const Funder = require('../models/Funder');

const SAMPLE_FUNDERS = [
  {
    name: 'Northstar Ventures',
    contact: { email: 'hello@northstar.vc', website: 'https://northstar.vc' },
    ticketSize: { min: 100000, max: 1000000 },
    stageFocus: ['Pre-seed', 'Seed'],
    geography: ['North America'],
    keywords: ['saas', 'b2b', 'productivity', 'ai'],
    notes: 'Hands-on go-to-market support.',
  },
  {
    name: 'Catalyst Collective',
    contact: { email: 'hi@catalystcollective.com' },
    ticketSize: { min: 250000, max: 3000000 },
    stageFocus: ['Seed', 'Series A'],
    geography: ['Global'],
    keywords: ['health', 'wellness', 'data', 'platform'],
    notes: 'Focus on health + climate data plays.',
  },
  {
    name: 'Civic Impact Angels',
    contact: { email: 'team@civicimpact.angel' },
    ticketSize: { min: 50000, max: 500000 },
    stageFocus: ['Pre-seed'],
    geography: ['US', 'India'],
    keywords: ['civic', 'government', 'education', 'inclusion'],
    notes: 'Mission driven capital.',
  },
];

const seedFunders = async () => {
  const count = await Funder.estimatedDocumentCount();
  if (count > 0) {
    return;
  }
  await Funder.insertMany(SAMPLE_FUNDERS);
  // eslint-disable-next-line no-console
  console.log('Seeded sample funders');
};

module.exports = { seedFunders };
