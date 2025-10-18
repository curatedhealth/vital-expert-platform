import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const PYTHON_BACKEND = process.env.PYTHON_EXPERT_SERVICE_URL || 'http://localhost:8001';

// Execute expert consultation
router.post('/execute', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_BACKEND}/expert/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stream reasoning (SSE)
router.get('/stream/:sessionId', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
  
  try {
    const pythonStream = await fetch(
      `${PYTHON_BACKEND}/expert/stream/${req.params.sessionId}`
    );
    
    if (!pythonStream.ok) {
      throw new Error(`Python service error: ${pythonStream.status}`);
    }
    
    // Pipe Python SSE to client
    pythonStream.body.pipe(res);
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Control endpoints
router.post('/control/:sessionId/pause', async (req, res) => {
  try {
    const response = await fetch(
      `${PYTHON_BACKEND}/expert/control/${req.params.sessionId}/pause`,
      { method: 'POST' }
    );
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/control/:sessionId/resume', async (req, res) => {
  try {
    const response = await fetch(
      `${PYTHON_BACKEND}/expert/control/${req.params.sessionId}/resume`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      }
    );
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/control/:sessionId/stop', async (req, res) => {
  try {
    const response = await fetch(
      `${PYTHON_BACKEND}/expert/control/${req.params.sessionId}/stop`,
      { method: 'POST' }
    );
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Session management
router.get('/sessions/:userId', async (req, res) => {
  try {
    const response = await fetch(
      `${PYTHON_BACKEND}/expert/sessions/${req.params.userId}?page=${req.query.page || 1}&limit=${req.query.limit || 10}`
    );
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sessions/:userId/:sessionId', async (req, res) => {
  try {
    const response = await fetch(
      `${PYTHON_BACKEND}/expert/sessions/${req.params.userId}/${req.params.sessionId}`
    );
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics
router.get('/analytics/:sessionId', async (req, res) => {
  try {
    const response = await fetch(
      `${PYTHON_BACKEND}/expert/analytics/${req.params.sessionId}`
    );
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mode Management Routes - Proxy to Python backend
router.post('/modes/sessions/start', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_BACKEND}/expert/modes/sessions/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/modes/sessions/:sessionId', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_BACKEND}/expert/modes/sessions/${req.params.sessionId}`);
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/modes/sessions/:sessionId', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_BACKEND}/expert/modes/sessions/${req.params.sessionId}`, {
      method: 'DELETE'
    });
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/modes/sessions/:sessionId/query', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_BACKEND}/expert/modes/sessions/${req.params.sessionId}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/modes/sessions/:sessionId/switch-mode', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_BACKEND}/expert/modes/sessions/${req.params.sessionId}/switch-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/modes/sessions/:sessionId/agents/search', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_BACKEND}/expert/modes/sessions/${req.params.sessionId}/agents/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/modes/agents/:agentId', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_BACKEND}/expert/modes/agents/${req.params.agentId}`);
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/modes/recommend-mode', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_BACKEND}/expert/modes/recommend-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/modes', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_BACKEND}/expert/modes`);
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/modes/sessions/:sessionId/history', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_BACKEND}/expert/modes/sessions/${req.params.sessionId}/history`);
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/modes/users/:userId/sessions', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_BACKEND}/expert/modes/users/${req.params.userId}/sessions`);
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
