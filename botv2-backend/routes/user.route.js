import { Router } from 'express';

import auth from '../middlewares/auth.middleware.js';
import limiter from '../middlewares/rateLimit.middleware.js';
import * as controllers from '../controllers/user.controller.js';

const router = Router();

router.get('/', auth, limiter(1), controllers.getMe);

router.put('/configs', auth, limiter(1), controllers.updateConfigs);

router.post('/messages', auth, limiter(1), controllers.sendMessage);

router.get('/positions', auth, limiter(1), controllers.getPositions);

router.put('/positions', auth, limiter(1), controllers.upsertPosition);

router.put('/status', auth, limiter(1), controllers.updateStatus);

export default router;
