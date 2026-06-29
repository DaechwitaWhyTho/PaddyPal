import express from 'express';
import cors from 'cors';
import multer from 'multer';

import sql from './db.js';
import { callLLM } from './llm.js';
import { predictDisease } from './aiClient.js';
import authRoutes from './authRoutes.js';
import authMiddleware from './authMiddleware.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG or PNG images are allowed'));
  },
});

app.get('/', (req, res) => res.send('PaddyPal server is alive 🌱'));

app.post('/api/scan', authMiddleware, upload.single('leafImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const { disease_name, confidence_score } = await predictDisease(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    const result = await sql`
      INSERT INTO scan_history (image_name, disease_name, confidence_score, user_id)
      VALUES (${req.file.originalname}, ${disease_name}, ${confidence_score}, ${req.user.user_id})
      RETURNING *
    `;

    return res.status(200).json({ success: true, data: result[0] });
  } catch (err) {
    console.error('Scan error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to process scan' });
  }
});

// NEW — this route was missing entirely
app.get('/api/scans', authMiddleware, async (req, res) => {
  try {
    const scans = await sql`
      SELECT * FROM scan_history
      WHERE user_id = ${req.user.user_id}
      ORDER BY scanned_at DESC
    `;
    res.json({ success: true, data: scans });
  } catch (err) {
    console.error('Fetch scans error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch scans' });
  }
});

app.post('/api/chat', authMiddleware, async (req, res) => {
  try {
    const { scan_id, message } = req.body;
    if (!scan_id || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'scan_id and message are required' });
    }

    // ownership check added — prevents asking questions about someone else's scan
    const scanRows = await sql`
      SELECT * FROM scan_history WHERE id = ${scan_id} AND user_id = ${req.user.user_id}
    `;
    if (scanRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }
    const scan = scanRows[0];

    await sql`INSERT INTO chat_messages (scan_id, role, content) VALUES (${scan_id}, 'user', ${message})`;

    const history = await sql`
      SELECT role, content FROM chat_messages WHERE scan_id = ${scan_id} ORDER BY created_at ASC
    `;

    const reply = await callLLM({
      diseaseName: scan.disease_name,
      confidenceScore: scan.confidence_score,
      conversationHistory: history,
      userMessage: message,
    });

    const savedReply = await sql`
      INSERT INTO chat_messages (scan_id, role, content) VALUES (${scan_id}, 'assistant', ${reply})
      RETURNING *
    `;

    return res.status(200).json({ success: true, data: savedReply[0] });
  } catch (err) {
    console.error('Chat error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to process chat message' });
  }
});

app.get('/api/scan/:id/messages', authMiddleware, async (req, res) => {
  try {
    // ownership check — without this, any logged-in user could read any scan's messages by guessing the id
    const owned = await sql`
      SELECT id FROM scan_history WHERE id = ${req.params.id} AND user_id = ${req.user.user_id}
    `;
    if (owned.length === 0) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }

    const messages = await sql`
      SELECT * FROM chat_messages
      WHERE scan_id = ${req.params.id}
      ORDER BY created_at ASC
    `;
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('Fetch messages error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));