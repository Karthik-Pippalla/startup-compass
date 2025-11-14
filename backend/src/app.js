const express = require('express');
const cors = require('cors');
const jobRoutes = require('./routes/jobRoutes');
const funderRoutes = require('./routes/funderRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/jobs', jobRoutes);
app.use('/api/funders', funderRoutes);

app.use(errorHandler);

module.exports = app;
