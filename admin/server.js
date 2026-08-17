require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tradingRoutes = require('./routes/trading');
const liquidityRoutes = require('./routes/liquidity');
const activityRoutes = require('./routes/activity');
const contractRoutes = require('./routes/contracts');
const statsRoutes = require('./routes/stats');
const statsService = require('./services/statsService');
const activityService = require('./services/activityService');
const { requireAdmin } = require('./middleware/auth');

const app = express();
const port = process.env.ADMIN_PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, status: 'admin-module-running', version: '1.0.0' });
});

app.get('/admin/overview', requireAdmin('overview:read'), async (req, res) => {
  try {
    const overview = await statsService.getOverviewStats();
    res.json({
      ok: true,
      overview,
      alerts: activityService.getAlerts(),
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Failed to load overview.' });
  }
});

app.use('/admin/auth', authRoutes);
app.use('/admin/users', userRoutes);
app.use('/admin/trading', tradingRoutes);
app.use('/admin/liquidity', liquidityRoutes);
app.use('/admin/activity', activityRoutes);
app.use('/admin/contracts', contractRoutes);
app.use('/admin/stats', statsRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Not found' });
});

const server = app.listen(port, () => {
  console.log(`NovaFi Admin API listening on http://localhost:${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${port} is already in use. Stop the other admin server or set ADMIN_PORT to a free port.`
    );
    process.exit(1);
  }
  throw error;
});
