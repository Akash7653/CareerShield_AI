// Force Google DNS — fixes ECONNREFUSED on networks with broken DNS (common in India)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { connectDB } = require('./db/database');
const { initClaude } = require('./services/claude');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://career-shield-ai-ebon.vercel.app',
    /^https:\/\/.*\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.use('/api/auth',  require('./routes/auth'));
app.use('/api/user',  require('./routes/user'));
app.use('/api/tools', require('./routes/tools'));

app.get('/api/health', (req, res) => {
  const claudeReady = !!process.env.ANTHROPIC_API_KEY &&
    process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';
  res.json({
    status: 'ok',
    message: '🦉 CareerShield AI v2.0 is running!',
    claudeReady,
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large. Max 10MB.' });
  res.status(500).json({ error: 'Internal server error.' });
});

async function start() {
  // DB never crashes the server — auto-falls back to JSON
  await connectDB();

  const claudeReady = initClaude();

  app.listen(PORT, () => {
    console.log('');
    console.log('  🦉  ╔══════════════════════════════════════════╗');
    console.log('  🦉  ║   CareerShield AI v2.0 — Running! 🚀    ║');
    console.log(`  🦉  ║   http://localhost:${PORT}                 ║`);
    console.log(`  🦉  ║   Claude AI : ${claudeReady ? '✅ Ready' : '❌ Add ANTHROPIC_API_KEY'}       ║`);
    console.log('  🦉  ╚══════════════════════════════════════════╝');
    console.log('');
    if (!claudeReady) {
      console.log('  ⚠️  ACTION NEEDED:');
      console.log('  1. Get free key → https://console.anthropic.com');
      console.log('  2. Add to backend/.env → ANTHROPIC_API_KEY=sk-ant-...');
      console.log('  3. Restart: npm start');
      console.log('');
    }
  });
}

start();
