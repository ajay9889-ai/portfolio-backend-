/**
 * analyticsRouter.ts
 * Telemetry endpoint protected by ANALYTICS_SECRET header or query param.
 */

import { Router, Request, Response } from 'express';
import { getAnalyticsSummary } from '../middleware/analyticsMiddleware.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const secret = process.env.ANALYTICS_SECRET;
  if (secret) {
    const provided = req.headers['x-analytics-secret'] || req.query.secret;
    if (provided !== secret) {
      res.status(401).json({ error: 'Unauthorized analytics access' });
      return;
    }
  }

  const summary = getAnalyticsSummary();
  res.json({
    ok: true,
    data: summary,
  });
});

export default router;
