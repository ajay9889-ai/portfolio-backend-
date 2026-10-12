/**
 * availabilityRouter.ts
 * Public endpoint returning Ajay's current availability status, note, and working hours.
 */

import { Router, Request, Response } from 'express';
import { getAvailability } from '../services/availability.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const config = getAvailability();
  res.json({
    ok: true,
    data: config,
  });
});

export default router;
