const Funder = require('../models/Funder');
const { extractKeywords } = require('../utils/text');

const createFunder = async (req, res, next) => {
  try {
    const { name, contact, ticketSize, stageFocus, geography, keywords, notes } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const funder = await Funder.create({
      name,
      contact,
      ticketSize,
      stageFocus,
      geography,
      keywords,
      notes,
    });

    res.status(201).json(funder);
  } catch (error) {
    next(error);
  }
};

const listFunders = async (req, res, next) => {
  try {
    const funders = await Funder.find().sort({ createdAt: -1 });
    res.json(funders);
  } catch (error) {
    next(error);
  }
};

const searchFunders = async (req, res, next) => {
  try {
    const keywords = extractKeywords(req.query.q || '');
    const matches = await Funder.find({ keywords: { $in: keywords } }).limit(10);
    res.json({ matches, keywords });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFunder,
  listFunders,
  searchFunders,
};
