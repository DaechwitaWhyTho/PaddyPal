import express from 'express';
import cors from 'cors';
import multer from 'multer';

import sql from './db.js';
import { predictDisease } from './aiClient.js';
import { pickBestDisease, getRemedies, getDiseaseMeta } from './diseaseData.js';
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

app.get('/', (req, res) => res.send('OnnoProhori server is alive 🌱'));

/**
 * STEP 1 — upload a leaf photo, get back the model's candidate diseases.
 * Nothing is "final" yet — disease_code/confidence_score stay null until
 * the user answers the crop-age question.
 */
app.post('/api/scan', authMiddleware, upload.single('leafImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const candidates = await predictDisease(req.file.buffer, req.file.originalname, req.file.mimetype);

    const result = await sql`
      INSERT INTO scan_history (image_name, candidates, user_id)
      VALUES (${req.file.originalname}, ${JSON.stringify(candidates)}, ${req.user.user_id})
      RETURNING *
    `;

    return res.status(200).json({ success: true, data: result[0] });
  } catch (err) {
    console.error('Scan error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to process scan' });
  }
});

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

/**
 * STEP 2 — user answers "young / adult / old". Combine that with the
 * candidate list's confidences + the risk_conditions table to settle on
 * one disease, then attach its remedies.
 */
app.post('/api/scan/:id/diagnose', authMiddleware, async (req, res) => {
  try {
    const { age_group } = req.body;
    if (!['young', 'adult', 'old'].includes(age_group)) {
      return res.status(400).json({ success: false, message: 'age_group must be young, adult, or old' });
    }

    const rows = await sql`
      SELECT * FROM scan_history WHERE id = ${req.params.id} AND user_id = ${req.user.user_id}
    `;
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }
    const scan = rows[0];
    const candidates = scan.candidates || [];
    if (candidates.length === 0) {
      return res.status(400).json({ success: false, message: 'This scan has no candidate diseases to diagnose' });
    }

    const { best } = pickBestDisease(candidates, age_group);
    const meta = getDiseaseMeta(best.disease_code);
    const remedies = best.disease_code === 'normal' ? [] : getRemedies(best.disease_code);

    const updated = await sql`
      UPDATE scan_history
      SET disease_code = ${best.disease_code},
          disease_name = ${meta?.name_en || best.disease_code},
          confidence_score = ${best.confidence},
          crop_age_group = ${age_group},
          risk_level = ${best.risk_level}
      WHERE id = ${scan.id}
      RETURNING *
    `;

    return res.status(200).json({
      success: true,
      data: {
        scan: updated[0],
        disease: meta,
        risk_level: best.risk_level,
        remedies,
      },
    });
  } catch (err) {
    console.error('Diagnose error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to diagnose scan' });
  }
});

/** Re-fetch a previously diagnosed scan's remedies (for revisiting from the sidebar). */
app.get('/api/scan/:id', authMiddleware, async (req, res) => {
  try {
    const rows = await sql`
      SELECT * FROM scan_history WHERE id = ${req.params.id} AND user_id = ${req.user.user_id}
    `;
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }
    const scan = rows[0];
    const meta = scan.disease_code ? getDiseaseMeta(scan.disease_code) : null;
    const remedies = scan.disease_code && scan.disease_code !== 'normal' ? getRemedies(scan.disease_code) : [];

    res.json({ success: true, data: { scan, disease: meta, risk_level: scan.risk_level, remedies } });
  } catch (err) {
    console.error('Fetch scan error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch scan' });
  }
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;