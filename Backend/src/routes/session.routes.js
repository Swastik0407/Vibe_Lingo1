// backend/src/routes/session.routes.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const sessionService = require('../services/session.service'); // ← looks for services/

const router = express.Router();
const SECRET = process.env.SESSION_SECRET || 'dev-secret';

router.post('/start', async (req, res) => {
  const { sourceLang, targetLang } = req.body;

  if (!sourceLang || !targetLang || sourceLang === targetLang) {
    return res.status(400).json({ error: 'invalid languages' });
  }

  const sessionId = uuidv4();
  const token = jwt.sign({ sessionId, sourceLang, targetLang }, SECRET, { expiresIn: '1h' });

  await sessionService.createSession({ sessionId, sourceLang, targetLang });

  res.json({
    sessionId,
    token,
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  });
});

module.exports = router;